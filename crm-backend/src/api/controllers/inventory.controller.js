// Inventory & Material Management Controller

export const getInventoryOverview = async (c) => {
    try {
        const prisma = c.get('prisma');
        const { category, search } = c.req.query();

        let where = {};
        if (category && category !== 'all') {
            where.category = category;
        }
        if (search) {
            where.OR = [
                { name: { contains: search } },
                { sku: { contains: search } },
                { companyBrand: { contains: search } },
                { make: { contains: search } },
                { category: { contains: search } }
            ];
        }

        let products = await prisma.product.findMany({
            where,
            orderBy: { category: 'asc' }
        });

        // If no products exist yet, seed default inventory catalog matching Quotation Generator
        if (products.length === 0 && (!category || category === 'all') && !search) {
            const seedItems = [
                { sku: 'PNL-WAR-550', name: 'Waaree 550W Topcon Bifacial Panel', category: 'Solar Panel', companyBrand: 'Waaree', make: 'Waaree Energies', description: 'Topcon Bifacial 550 Wp Solar Module', warranty: '30 Years', minStock: 20, maxStock: 200, currentStock: 120, unitPrice: 14500, imageUrl: '/assets/logo-icon.png' },
                { sku: 'PNL-ADN-550', name: 'Adani 550W Mono PERC Panel', category: 'Solar Panel', companyBrand: 'Adani', make: 'Adani Solar', description: 'Mono PERC 550 Wp Solar Module', warranty: '25 Years', minStock: 20, maxStock: 200, currentStock: 80, unitPrice: 14200, imageUrl: '/assets/logo-icon.png' },
                { sku: 'INV-DYE-5KW', name: 'Deye 5kW On-Grid Inverter', category: 'Solar Inverter', companyBrand: 'Deye', make: 'Deye Inverters', description: 'On-grid String Inverter 5.0 KW Dual MPPT', warranty: '10 Years', minStock: 5, maxStock: 30, currentStock: 15, unitPrice: 38000, imageUrl: '/assets/logo-icon.png' },
                { sku: 'INV-APS-5KW', name: 'AP Systems 5kW Micro Inverter', category: 'Solar Inverter', companyBrand: 'AP Systems', make: 'AP Systems', description: 'On-grid Quad Micro Inverter 5.0 KW', warranty: '12 Years', minStock: 5, maxStock: 25, currentStock: 10, unitPrice: 42000, imageUrl: '/assets/logo-icon.png' },
                { sku: 'STR-RCC-HDG', name: 'RCC Roof HDG Mounting Structure', category: 'Mounting Structure', companyBrand: 'Generic', make: 'Hot Dip Galvanized', description: 'Module Mounting Structure 80 Micron Galvanized', warranty: '15 Years', minStock: 10, maxStock: 50, currentStock: 35, unitPrice: 6500, imageUrl: '/assets/logo-icon.png' },
                { sku: 'BOX-ACDB-3P', name: 'ACDB 3-Phase Protection Box', category: 'ACDB', companyBrand: 'L&T', make: 'L&T / Schneider', description: 'AC Distribution Box with SPD & MCB', warranty: '5 Years', minStock: 5, maxStock: 40, currentStock: 22, unitPrice: 3200, imageUrl: '/assets/logo-icon.png' },
                { sku: 'BOX-DCDB-2I', name: 'DCDB 2-In 2-Out Protection Box', category: 'DCDB', companyBrand: 'L&T', make: 'L&T / Hensel', description: 'DC Distribution Box 1000V Fuse & SPD', warranty: '5 Years', minStock: 5, maxStock: 40, currentStock: 25, unitPrice: 2800, imageUrl: '/assets/logo-icon.png' },
                { sku: 'ERT-COP-3M', name: 'Copper Bonded Earthing Electrode 3m', category: 'Earthing Material', companyBrand: 'Standard', make: 'Pure Copper Bonded', description: 'Chemical Earthing Rod 17.2mm x 3m with Compound', warranty: '10 Years', minStock: 15, maxStock: 80, currentStock: 45, unitPrice: 1850, imageUrl: '/assets/logo-icon.png' },
                { sku: 'LGT-ARR-COP', name: 'Copper Lightning Arrestor Spike', category: 'Lightning Arrestor', companyBrand: 'Standard', make: 'ESE / Copper', description: 'Lightning Protection Rod with Insulator Base', warranty: '10 Years', minStock: 5, maxStock: 30, currentStock: 18, unitPrice: 2400, imageUrl: '/assets/logo-icon.png' },
                { sku: 'CBL-DC-4SQ', name: 'Polycab 4 Sqmm DC Solar Cable (100m)', category: 'DC Wire', companyBrand: 'Polycab', make: 'Polycab / Havells', description: 'Cross-linked Polyolefin XLPO DC Solar Cable', warranty: '25 Years', minStock: 5, maxStock: 30, currentStock: 12, unitPrice: 5500, imageUrl: '/assets/logo-icon.png' },
                { sku: 'CBL-AC-6SQ', name: 'Havells 4 Core 6 Sqmm Armoured AC Cable (100m)', category: 'AC Wire', companyBrand: 'Havells', make: 'Havells / Polycab', description: 'XLPE Armoured Aluminum AC Power Cable', warranty: '10 Years', minStock: 3, maxStock: 20, currentStock: 8, unitPrice: 12500, imageUrl: '/assets/logo-icon.png' },
                { sku: 'CNT-MC4-PAIR', name: 'MC4 Male Female Connectors (Pack of 10)', category: 'MC4 Connector', companyBrand: 'Staubli', make: 'Staubli MC4', description: '1000V DC IP68 Waterproof Solar Connectors', warranty: '10 Years', minStock: 20, maxStock: 100, currentStock: 65, unitPrice: 450, imageUrl: '/assets/logo-icon.png' },
                { sku: 'PIPE-PVC-25MM', name: 'Heavy Duty PVC Conduit Pipe 25mm (3m)', category: 'PVC Pipe', companyBrand: 'Supreme', make: 'Supreme / Finolex', description: 'Rigid UV Resistant PVC Conduit Pipe', warranty: '5 Years', minStock: 30, maxStock: 300, currentStock: 180, unitPrice: 180, imageUrl: '/assets/logo-icon.png' },
                { sku: 'TIE-UV-300MM', name: 'Nylon UV Cable Ties 300mm (Pack of 100)', category: 'Cable Tie', companyBrand: 'Generic', make: 'Heavy Duty UV Nylon', description: 'Weather Proof Black Cable Ties', warranty: '2 Years', minStock: 10, maxStock: 100, currentStock: 50, unitPrice: 220, imageUrl: '/assets/logo-icon.png' },
                { sku: 'HOOK-SS304', name: 'J Hook Corrosion Free SS 304 (Set of 10)', category: 'Fasteners', companyBrand: 'Generic', make: 'Stainless Steel 304', description: 'SS 304 Mounting Clamps & J Hooks', warranty: '10 Years', minStock: 10, maxStock: 80, currentStock: 40, unitPrice: 850, imageUrl: '/assets/logo-icon.png' }
            ];

            for (const item of seedItems) {
                await prisma.product.create({ data: item });
            }

            products = await prisma.product.findMany({ where, orderBy: { category: 'asc' } });
        }

        // Summary Calculations
        const totalItems = products.length;
        const totalValuation = products.reduce((sum, p) => sum + (p.currentStock * p.unitPrice), 0);
        const totalReserved = products.reduce((sum, p) => sum + p.reservedStock, 0);
        const lowStockCount = products.filter(p => p.currentStock <= p.minStock).length;

        return c.json({
            success: true,
            summary: {
                totalItems,
                totalValuation,
                totalReserved,
                lowStockCount
            },
            products
        });
    } catch (e) {
        console.error("Get Inventory Overview Error:", e);
        return c.json({ message: 'Error loading inventory data', error: e.message }, 500);
    }
};

export const createOrUpdateProduct = async (c) => {
    try {
        const prisma = c.get('prisma');
        const user = c.get('user');
        const body = await c.req.json();

        const {
            id,
            sku,
            name,
            category,
            description,
            make,
            companyBrand,
            customBrand,
            warranty,
            minStock,
            maxStock,
            currentStock,
            unitPrice,
            imageUrl
        } = body;

        const parsedMin = parseInt(minStock, 10);
        const parsedMax = parseInt(maxStock, 10);
        const parsedCurrent = parseInt(currentStock, 10);
        const parsedPrice = parseFloat(unitPrice);

        const safeMin = !isNaN(parsedMin) ? parsedMin : 5;
        const safeMax = !isNaN(parsedMax) ? parsedMax : 100;
        const safeCurrent = !isNaN(parsedCurrent) ? parsedCurrent : 0;
        const safePrice = !isNaN(parsedPrice) ? parsedPrice : 0;

        const finalBrand = companyBrand === 'Other' && customBrand ? customBrand : (companyBrand || make || 'Generic');
        const finalSku = sku || `${category.substring(0, 3).toUpperCase()}-${finalBrand.substring(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

        let product;
        if (id) {
            product = await prisma.product.update({
                where: { id },
                data: {
                    sku: finalSku,
                    name,
                    category,
                    description: description || '',
                    make: make || finalBrand,
                    companyBrand: finalBrand,
                    warranty: warranty || '10 Years',
                    minStock: safeMin,
                    maxStock: safeMax,
                    currentStock: safeCurrent,
                    unitPrice: safePrice,
                    imageUrl: imageUrl || null
                }
            });
        } else {
            product = await prisma.product.create({
                data: {
                    sku: finalSku,
                    name,
                    category,
                    description: description || '',
                    make: make || finalBrand,
                    companyBrand: finalBrand,
                    warranty: warranty || '10 Years',
                    minStock: safeMin,
                    maxStock: safeMax,
                    currentStock: safeCurrent,
                    unitPrice: safePrice,
                    imageUrl: imageUrl || null
                }
            });

            // Log initial stock creation movement
            await prisma.stockMovement.create({
                data: {
                    itemSku: finalSku,
                    itemName: name,
                    category,
                    movementType: 'GRN',
                    quantity: safeCurrent,
                    notes: 'Initial Product Stock Master Entry',
                    createdBy: user ? user.name : 'System'
                }
            });
        }

        return c.json({ success: true, product });
    } catch (e) {
        console.error("Save Product Error:", e);
        return c.json({ message: 'Error saving product', error: e.message }, 500);
    }
};

export const quickUpdateStock = async (c) => {
    try {
        const prisma = c.get('prisma');
        const user = c.get('user');
        const id = c.req.param('id');
        const body = await c.req.json();

        const { currentStock, unitPrice } = body;

        const updated = await prisma.product.update({
            where: { id },
            data: {
                currentStock: currentStock !== undefined ? Number(currentStock) : undefined,
                unitPrice: unitPrice !== undefined ? Number(unitPrice) : undefined
            }
        });

        return c.json({ success: true, product: updated });
    } catch (e) {
        console.error("Quick Update Stock Error:", e);
        return c.json({ message: 'Error updating product stock', error: e.message }, 500);
    }
};

export const getPanelSerials = async (c) => {
    try {
        const prisma = c.get('prisma');
        let serials = await prisma.panelSerialNumber.findMany({
            orderBy: { createdAt: 'desc' }
        });

        // Seed default panel serial numbers if empty
        if (serials.length === 0) {
            const defaultSerials = [
                { serialNumber: 'WAR-2026-PNL-9081', itemSku: 'PNL-WAR-550', itemName: 'Waaree 550W Topcon Panel', brand: 'Waaree', wattage: '550W', status: 'In_Warehouse' },
                { serialNumber: 'WAR-2026-PNL-9082', itemSku: 'PNL-WAR-550', itemName: 'Waaree 550W Topcon Panel', brand: 'Waaree', wattage: '550W', status: 'In_Warehouse' },
                { serialNumber: 'WAR-2026-PNL-9083', itemSku: 'PNL-WAR-550', itemName: 'Waaree 550W Topcon Panel', brand: 'Waaree', wattage: '550W', status: 'Reserved', notes: 'Reserved for Project Rajesh Mehta' },
                { serialNumber: 'ADN-2026-PNL-4410', itemSku: 'PNL-ADN-550', itemName: 'Adani 550W Mono PERC Panel', brand: 'Adani', wattage: '550W', status: 'In_Warehouse' },
                { serialNumber: 'DYE-2026-INV-1102', itemSku: 'INV-DYE-5KW', itemName: 'Deye 5kW Inverter', brand: 'Deye', wattage: '5KW', status: 'In_Warehouse' }
            ];

            for (const s of defaultSerials) {
                await prisma.panelSerialNumber.create({ data: s });
            }

            serials = await prisma.panelSerialNumber.findMany({ orderBy: { createdAt: 'desc' } });
        }

        return c.json(serials);
    } catch (e) {
        console.error("Get Panel Serials Error:", e);
        return c.json({ message: 'Error fetching panel serial numbers', error: e.message }, 500);
    }
};

export const addPanelSerial = async (c) => {
    try {
        const prisma = c.get('prisma');
        const body = await c.req.json();
        const { serialNumber, itemSku, itemName, brand, wattage, status, notes } = body;

        if (!serialNumber) {
            return c.json({ message: 'Serial number is required' }, 400);
        }

        const serial = await prisma.panelSerialNumber.create({
            data: {
                serialNumber,
                itemSku: itemSku || 'PNL-WAR-550',
                itemName: itemName || 'Solar Panel',
                brand: brand || 'Waaree',
                wattage: wattage || '550W',
                status: status || 'In_Warehouse',
                notes: notes || ''
            }
        });

        return c.json({ success: true, serial });
    } catch (e) {
        console.error("Add Panel Serial Error:", e);
        return c.json({ message: 'Error adding panel serial number', error: e.message }, 500);
    }
};

export const deletePanelSerial = async (c) => {
    try {
        const prisma = c.get('prisma');
        const id = c.req.param('id');

        await prisma.panelSerialNumber.delete({ where: { id } });
        return c.json({ success: true, message: 'Serial number deleted' });
    } catch (e) {
        console.error("Delete Panel Serial Error:", e);
        return c.json({ message: 'Error deleting panel serial', error: e.message }, 500);
    }
};

export const deleteProduct = async (c) => {
    try {
        const prisma = c.get('prisma');
        const user = c.get('user');
        const id = c.req.param('id');

        if (user.role !== 'Master') {
            return c.json({ message: 'Only Master Admins can delete inventory products' }, 403);
        }

        await prisma.product.delete({ where: { id } });
        return c.json({ success: true, message: 'Product deleted from inventory' });
    } catch (e) {
        console.error("Delete Product Error:", e);
        return c.json({ message: 'Error deleting product', error: e.message }, 500);
    }
};

export const getPurchaseOrders = async (c) => {
    try {
        const prisma = c.get('prisma');
        const orders = await prisma.purchaseOrder.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return c.json(orders);
    } catch (e) {
        console.error("Get Purchase Orders Error:", e);
        return c.json({ message: 'Error fetching purchase orders', error: e.message }, 500);
    }
};

export const createPurchaseOrder = async (c) => {
    try {
        const prisma = c.get('prisma');
        const user = c.get('user');
        const body = await c.req.json();

        const { vendorName, vendorGst, orderDate, expectedDelivery, totalAmount, paymentStatus, grnNotes, items } = body;
        const poNo = `VE-PO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

        const po = await prisma.purchaseOrder.create({
            data: {
                poNo,
                vendorName,
                vendorGst: vendorGst || '',
                orderDate: orderDate || new Date().toISOString().split('T')[0],
                expectedDelivery: expectedDelivery || null,
                totalAmount: Number(totalAmount) || 0,
                paymentStatus: paymentStatus || 'Pending',
                status: 'Ordered',
                grnNotes: grnNotes || ''
            }
        });

        // If items are received immediately (GRN)
        if (Array.isArray(items) && items.length > 0) {
            for (const item of items) {
                if (item.sku && item.qty) {
                    const prod = await prisma.product.findUnique({ where: { sku: item.sku } });
                    if (prod) {
                        await prisma.product.update({
                            where: { sku: item.sku },
                            data: { currentStock: prod.currentStock + Number(item.qty) }
                        });

                        await prisma.stockMovement.create({
                            data: {
                                itemSku: item.sku,
                                itemName: prod.name,
                                category: prod.category,
                                movementType: 'GRN',
                                quantity: Number(item.qty),
                                referenceNo: poNo,
                                notes: `Received via PO #${poNo} from ${vendorName}`,
                                createdBy: user ? user.name : 'System'
                            }
                        });
                    }
                }
            }
        }

        return c.json({ success: true, purchaseOrder: po });
    } catch (e) {
        console.error("Create Purchase Order Error:", e);
        return c.json({ message: 'Error creating purchase order', error: e.message }, 500);
    }
};

export const reserveProjectStock = async (c) => {
    try {
        const prisma = c.get('prisma');
        const user = c.get('user');
        const body = await c.req.json();

        const { leadId, items } = body; // Array of { sku, qty }

        if (!leadId || !Array.isArray(items)) {
            return c.json({ message: 'Invalid lead ID or items list' }, 400);
        }

        const reservations = [];
        for (const item of items) {
            const prod = await prisma.product.findUnique({ where: { sku: item.sku } });
            if (prod) {
                const qty = Number(item.qty) || 1;
                
                // Update product reserved stock
                await prisma.product.update({
                    where: { sku: item.sku },
                    data: { reservedStock: prod.reservedStock + qty }
                });

                const res = await prisma.materialReservation.create({
                    data: {
                        leadId,
                        itemSku: item.sku,
                        itemName: prod.name,
                        reservedQty: qty,
                        status: 'Reserved'
                    }
                });
                reservations.push(res);

                // Log movement
                await prisma.stockMovement.create({
                    data: {
                        itemSku: item.sku,
                        itemName: prod.name,
                        category: prod.category,
                        movementType: 'Reserved',
                        quantity: qty,
                        referenceNo: leadId,
                        notes: `Reserved for Project #${leadId}`,
                        createdBy: user ? user.name : 'System'
                    }
                });
            }
        }

        return c.json({ success: true, reservations });
    } catch (e) {
        console.error("Reserve Stock Error:", e);
        return c.json({ message: 'Error reserving project stock', error: e.message }, 500);
    }
};

export const generateDispatchChallan = async (c) => {
    try {
        const prisma = c.get('prisma');
        const user = c.get('user');
        const body = await c.req.json();

        const { leadId, vehicleNo, driverName, loadingPhotoUrl, remarks, items } = body;
        // items: Array of { sku, name, qty, unitPrice }
        const challanNo = `VE-DC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

        const safeItems = Array.isArray(items) ? items : [];
        let totalMaterialCost = 0;

        // 1. Auto-deduct inventory for each dispatched item
        for (const item of safeItems) {
            if (!item.sku || !item.qty) continue;
            const prod = await prisma.product.findUnique({ where: { sku: item.sku } });
            if (prod) {
                const qty = parseInt(item.qty, 10) || 0;
                const itemCost = qty * (parseFloat(item.unitPrice) || prod.unitPrice || 0);
                totalMaterialCost += itemCost;

                // Deduct from current stock (allow negative with a warning)
                const newStock = prod.currentStock - qty;
                await prisma.product.update({
                    where: { sku: item.sku },
                    data: { currentStock: newStock }
                });

                // Log stock movement
                await prisma.stockMovement.create({
                    data: {
                        itemSku: item.sku,
                        itemName: prod.name,
                        category: prod.category,
                        movementType: 'Dispatched',
                        quantity: qty,
                        referenceNo: challanNo,
                        notes: `Dispatched via Challan #${challanNo} to Lead ${leadId}`,
                        createdBy: user ? user.name : 'Warehouse Manager'
                    }
                });
            }
        }

        const challan = await prisma.dispatchChallan.create({
            data: {
                challanNo,
                leadId,
                dispatchDate: new Date().toISOString().split('T')[0],
                vehicleNo,
                driverName: driverName || '',
                authorizedBy: user ? user.name : 'Warehouse Manager',
                loadingPhotoUrl: loadingPhotoUrl || null,
                remarks: remarks || '',
                dispatchItems: JSON.stringify(safeItems),
                totalMaterialCost
            }
        });

        // 2. Auto-update project finance materialCost
        if (totalMaterialCost > 0) {
            const existingFinance = await prisma.projectFinance.findUnique({ where: { leadId } });
            if (existingFinance) {
                const newMaterialCost = existingFinance.materialCost + totalMaterialCost;
                const totalExpenses = newMaterialCost
                    + existingFinance.laborCost
                    + existingFinance.transportCost
                    + existingFinance.electricianCost
                    + existingFinance.otherExpenses;
                const grossProfit = existingFinance.quotationAmount - totalExpenses;
                const profitMargin = existingFinance.quotationAmount > 0
                    ? parseFloat(((grossProfit / existingFinance.quotationAmount) * 100).toFixed(2))
                    : 0;
                await prisma.projectFinance.update({
                    where: { leadId },
                    data: { materialCost: newMaterialCost, totalExpenses, grossProfit, profitMargin }
                });
            } else {
                // Create finance record with material cost
                await prisma.projectFinance.create({
                    data: {
                        leadId,
                        materialCost: totalMaterialCost,
                        totalExpenses: totalMaterialCost,
                        grossProfit: -totalMaterialCost,
                        profitMargin: 0
                    }
                });
            }
        }

        // 3. Update lead pipeline stage to Material_Dispatched
        const lead = await prisma.lead.findUnique({ where: { id: leadId } });
        if (lead) {
            await prisma.lead.update({
                where: { id: leadId },
                data: { pipelineStage: 'Material_Dispatched' }
            });

            await prisma.activity.create({
                data: {
                    leadId,
                    action: 'Materials Dispatched',
                    notes: `Issued Dispatch Challan #${challanNo} via Vehicle ${vehicleNo} (Driver: ${driverName || 'N/A'}) | Material Cost: ₹${totalMaterialCost.toLocaleString('en-IN')}`,
                    user: user ? user.name : 'Warehouse Manager'
                }
            });
        }

        return c.json({ success: true, challan, totalMaterialCost });
    } catch (e) {
        console.error('Generate Dispatch Challan Error:', e);
        return c.json({ message: 'Error generating dispatch challan', error: e.message }, 500);
    }
};

export const getInventoryAnalytics = async (c) => {
    try {
        const prisma = c.get('prisma');
        const movements = await prisma.stockMovement.findMany({
            take: 50,
            orderBy: { createdAt: 'desc' }
        });

        const challans = await prisma.dispatchChallan.findMany({
            take: 20,
            include: { lead: { select: { name: true, phone: true } } },
            orderBy: { createdAt: 'desc' }
        });

        return c.json({
            success: true,
            movements,
            challans
        });
    } catch (e) {
        console.error('Get Inventory Analytics Error:', e);
        return c.json({ message: 'Error fetching analytics', error: e.message }, 500);
    }
};

// POST /api/admin/inventory/grn/:poId — Confirm GRN: update stock from PO items
export const confirmGRN = async (c) => {
    try {
        const prisma = c.get('prisma');
        const user = c.get('user');
        const poId = c.req.param('poId');
        const body = await c.req.json();

        // items: Array of { sku, name, qty, unitPrice }
        const { items, pdfUrl } = body;

        if (!Array.isArray(items) || items.length === 0) {
            return c.json({ message: 'Items list is required for GRN confirmation' }, 400);
        }

        const po = await prisma.purchaseOrder.findUnique({ where: { id: poId } });
        if (!po) return c.json({ message: 'Purchase Order not found' }, 404);

        const updatedProducts = [];

        for (const item of items) {
            if (!item.sku || !item.qty) continue;
            const qty = parseInt(item.qty, 10) || 0;
            if (qty <= 0) continue;

            const prod = await prisma.product.findUnique({ where: { sku: item.sku } });
            if (prod) {
                const newStock = prod.currentStock + qty;
                const newPrice = item.unitPrice ? parseFloat(item.unitPrice) : prod.unitPrice;

                await prisma.product.update({
                    where: { sku: item.sku },
                    data: {
                        currentStock: newStock,
                        unitPrice: newPrice
                    }
                });

                await prisma.stockMovement.create({
                    data: {
                        itemSku: item.sku,
                        itemName: prod.name,
                        category: prod.category,
                        movementType: 'GRN',
                        quantity: qty,
                        referenceNo: po.poNo,
                        notes: `GRN confirmed from PO #${po.poNo} (${po.vendorName}) — ${qty} units received`,
                        createdBy: user ? user.name : 'System'
                    }
                });

                updatedProducts.push({ sku: item.sku, name: prod.name, added: qty, newStock });
            }
        }

        // Update PO status to Received
        await prisma.purchaseOrder.update({
            where: { id: poId },
            data: {
                status: 'Received',
                paymentStatus: body.paymentStatus || po.paymentStatus,
                invoiceUrl: pdfUrl || po.invoiceUrl,
                grnNotes: body.grnNotes || po.grnNotes
            }
        });

        return c.json({
            success: true,
            message: `GRN confirmed. ${updatedProducts.length} products updated.`,
            updatedProducts
        });
    } catch (e) {
        console.error('Confirm GRN Error:', e);
        return c.json({ message: 'Error confirming GRN', error: e.message }, 500);
    }
};
