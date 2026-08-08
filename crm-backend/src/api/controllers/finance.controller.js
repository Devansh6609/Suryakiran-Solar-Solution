// Project Finance Controller — Per-Lead Budget, Expenses, and Profit Tracking

const recalcFinance = (finance) => {
    const totalExpenses = (finance.materialCost || 0)
        + (finance.laborCost || 0)
        + (finance.transportCost || 0)
        + (finance.electricianCost || 0)
        + (finance.otherExpenses || 0);
    const grossProfit = (finance.quotationAmount || 0) - totalExpenses;
    const profitMargin = (finance.quotationAmount || 0) > 0
        ? parseFloat(((grossProfit / finance.quotationAmount) * 100).toFixed(2))
        : 0;
    return { totalExpenses, grossProfit, profitMargin };
};

// GET /api/admin/finance/:leadId — Get project finance for a specific lead
export const getProjectFinance = async (c) => {
    try {
        const prisma = c.get('prisma');
        const leadId = c.req.param('leadId');

        let finance = await prisma.projectFinance.findUnique({
            where: { leadId }
        });

        // Get all expenses for this lead
        const expenses = await prisma.projectExpense.findMany({
            where: { leadId },
            orderBy: { createdAt: 'desc' }
        });

        // If no finance record exists yet, create a default one
        if (!finance) {
            // Try to get quotation amount from approved quotation
            const approvedQuotation = await prisma.quotation.findFirst({
                where: { leadId, status: { in: ['Accepted', 'Converted', 'Sent'] } },
                orderBy: { createdAt: 'desc' }
            });

            finance = await prisma.projectFinance.create({
                data: {
                    leadId,
                    quotationAmount: approvedQuotation ? approvedQuotation.netCost || approvedQuotation.totalAmount : 0,
                }
            });
        }

        return c.json({ success: true, finance, expenses });
    } catch (e) {
        console.error('Get Project Finance Error:', e);
        return c.json({ message: 'Error fetching project finance', error: e.message }, 500);
    }
};

// PATCH /api/admin/finance/:leadId — Update income fields (quotation, advance, final)
export const updateProjectFinance = async (c) => {
    try {
        const prisma = c.get('prisma');
        const leadId = c.req.param('leadId');
        const body = await c.req.json();

        const {
            quotationAmount,
            advanceReceived,
            finalPaymentReceived,
            laborCost,
            transportCost,
            electricianCost,
            otherExpenses,
            notes
        } = body;

        // Get existing finance record
        let existing = await prisma.projectFinance.findUnique({ where: { leadId } });
        const base = existing || {};

        const updatedData = {
            quotationAmount: quotationAmount !== undefined ? parseFloat(quotationAmount) : (base.quotationAmount || 0),
            advanceReceived: advanceReceived !== undefined ? parseFloat(advanceReceived) : (base.advanceReceived || 0),
            finalPaymentReceived: finalPaymentReceived !== undefined ? parseFloat(finalPaymentReceived) : (base.finalPaymentReceived || 0),
            laborCost: laborCost !== undefined ? parseFloat(laborCost) : (base.laborCost || 0),
            transportCost: transportCost !== undefined ? parseFloat(transportCost) : (base.transportCost || 0),
            electricianCost: electricianCost !== undefined ? parseFloat(electricianCost) : (base.electricianCost || 0),
            otherExpenses: otherExpenses !== undefined ? parseFloat(otherExpenses) : (base.otherExpenses || 0),
            materialCost: base.materialCost || 0,
            notes: notes !== undefined ? notes : (base.notes || '')
        };

        const { totalExpenses, grossProfit, profitMargin } = recalcFinance(updatedData);

        const finance = await prisma.projectFinance.upsert({
            where: { leadId },
            create: { leadId, ...updatedData, totalExpenses, grossProfit, profitMargin },
            update: { ...updatedData, totalExpenses, grossProfit, profitMargin }
        });

        return c.json({ success: true, finance });
    } catch (e) {
        console.error('Update Project Finance Error:', e);
        return c.json({ message: 'Error updating project finance', error: e.message }, 500);
    }
};

// POST /api/admin/finance/:leadId/expenses — Add a new expense line item
export const addProjectExpense = async (c) => {
    try {
        const prisma = c.get('prisma');
        const user = c.get('user');
        const leadId = c.req.param('leadId');
        const body = await c.req.json();

        const { expenseType, description, amount, paidTo, receiptUrl, date } = body;

        if (!description || !amount) {
            return c.json({ message: 'Description and amount are required' }, 400);
        }

        const expense = await prisma.projectExpense.create({
            data: {
                leadId,
                expenseType: expenseType || 'Other',
                description,
                amount: parseFloat(amount),
                paidTo: paidTo || '',
                receiptUrl: receiptUrl || null,
                addedBy: user ? user.name : 'Admin',
                date: date || new Date().toISOString().split('T')[0]
            }
        });

        // Recalculate otherExpenses from all non-material expenses
        const allExpenses = await prisma.projectExpense.findMany({ where: { leadId } });
        const manualExpenseTotal = allExpenses
            .filter(e => e.expenseType !== 'Material')
            .reduce((sum, e) => sum + e.amount, 0);

        // Update finance record
        const finance = await prisma.projectFinance.findUnique({ where: { leadId } });
        if (finance) {
            const updatedOther = manualExpenseTotal;
            const { totalExpenses, grossProfit, profitMargin } = recalcFinance({
                ...finance,
                otherExpenses: updatedOther
            });
            await prisma.projectFinance.update({
                where: { leadId },
                data: { otherExpenses: updatedOther, totalExpenses, grossProfit, profitMargin }
            });
        }

        return c.json({ success: true, expense });
    } catch (e) {
        console.error('Add Project Expense Error:', e);
        return c.json({ message: 'Error adding project expense', error: e.message }, 500);
    }
};

// DELETE /api/admin/finance/expenses/:id — Remove an expense
export const deleteProjectExpense = async (c) => {
    try {
        const prisma = c.get('prisma');
        const id = c.req.param('id');

        const expense = await prisma.projectExpense.findUnique({ where: { id } });
        if (!expense) return c.json({ message: 'Expense not found' }, 404);

        await prisma.projectExpense.delete({ where: { id } });

        // Recalculate finance for this lead
        const allExpenses = await prisma.projectExpense.findMany({ where: { leadId: expense.leadId } });
        const manualExpenseTotal = allExpenses
            .filter(e => e.expenseType !== 'Material')
            .reduce((sum, e) => sum + e.amount, 0);

        const finance = await prisma.projectFinance.findUnique({ where: { leadId: expense.leadId } });
        if (finance) {
            const { totalExpenses, grossProfit, profitMargin } = recalcFinance({
                ...finance,
                otherExpenses: manualExpenseTotal
            });
            await prisma.projectFinance.update({
                where: { leadId: expense.leadId },
                data: { otherExpenses: manualExpenseTotal, totalExpenses, grossProfit, profitMargin }
            });
        }

        return c.json({ success: true, message: 'Expense deleted' });
    } catch (e) {
        console.error('Delete Project Expense Error:', e);
        return c.json({ message: 'Error deleting expense', error: e.message }, 500);
    }
};

// GET /api/admin/finance/dashboard-summary — Dashboard-level profit totals
export const getFinanceDashboardSummary = async (c) => {
    try {
        const prisma = c.get('prisma');
        const user = c.get('user');
        const { vendorId, startDate, endDate } = c.req.query();

        let leadWhere = {};
        if (user.role === 'Vendor') {
            leadWhere.assignedVendorId = user.id;
        } else if (vendorId && vendorId !== 'all') {
            leadWhere.assignedVendorId = vendorId;
        }

        if (startDate || endDate) {
            leadWhere.createdAt = {};
            if (startDate) leadWhere.createdAt.gte = new Date(startDate);
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                leadWhere.createdAt.lte = end;
            }
        }

        let financeWhere = {};
        if (Object.keys(leadWhere).length > 0) {
            financeWhere.lead = leadWhere;
        }

        const allFinance = await prisma.projectFinance.findMany({
            where: financeWhere
        });
        const totalRevenue = allFinance.reduce((sum, f) => sum + f.quotationAmount, 0);
        const totalReceived = allFinance.reduce((sum, f) => sum + f.advanceReceived + f.finalPaymentReceived, 0);
        const totalMaterialCost = allFinance.reduce((sum, f) => sum + f.materialCost, 0);
        const totalExpenses = allFinance.reduce((sum, f) => sum + f.totalExpenses, 0);
        const totalProfit = allFinance.reduce((sum, f) => sum + f.grossProfit, 0);
        const avgMargin = allFinance.length > 0
            ? parseFloat((allFinance.reduce((sum, f) => sum + f.profitMargin, 0) / allFinance.length).toFixed(2))
            : 0;

        return c.json({
            success: true,
            summary: {
                totalRevenue,
                totalReceived,
                totalMaterialCost,
                totalExpenses,
                totalProfit,
                avgMargin,
                projectCount: allFinance.length
            }
        });
    } catch (e) {
        console.error('Finance Dashboard Summary Error:', e);
        return c.json({ message: 'Error fetching finance summary', error: e.message }, 500);
    }
};
