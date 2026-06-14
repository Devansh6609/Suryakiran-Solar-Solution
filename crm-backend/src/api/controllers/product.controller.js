import crypto from 'node:crypto';
import path from 'node:path';

// Helper to get buffer from Hono File/Blob
async function getBuffer(file) {
    if (!file) return null;
    const arrayBuffer = await file.arrayBuffer();
    return Buffer.from(arrayBuffer);
}

// Dynamic fs import for local file system operations (safely bypassed on Cloudflare Workers)
async function getFs() {
    try {
        return await import('node:fs/promises');
    } catch (e) {
        return null;
    }
}

export const getProducts = async (c) => {
    try {
        const prisma = c.get('prisma');
        const products = await prisma.product.findMany({
            orderBy: { category: 'asc' }
        });
        return c.json(products);
    } catch (e) {
        console.error("Get Products Error:", e);
        return c.json({ message: 'Error fetching products', error: e.message }, 500);
    }
};

export const createProduct = async (c) => {
    try {
        const prisma = c.get('prisma');
        const body = await c.req.parseBody();
        
        const name = body.name || '';
        const category = body.category || '';
        const description = body.description || '';
        const make = body.make || '';
        const file = body.image;
        
        let imageUrl = body.imageUrl || null;

        if (file && typeof file !== 'string' && file.size > 0) {
            const buffer = await getBuffer(file);
            const key = `products/${crypto.randomUUID()}-${file.name}`;
            
            if (c.env.BUCKET) {
                // Upload to Cloudflare R2
                await c.env.BUCKET.put(key, buffer, {
                    httpMetadata: { contentType: file.type || 'image/jpeg' }
                });
                imageUrl = `/files/${key}`;
            } else {
                // Local disk storage fallback
                const fs = await getFs();
                if (fs) {
                    const targetDir = path.join(process.cwd(), 'uploads', 'products');
                    await fs.mkdir(targetDir, { recursive: true });
                    const filePath = path.join(process.cwd(), 'uploads', key);
                    await fs.writeFile(filePath, buffer);
                    imageUrl = `/files/${key}`;
                }
            }
        }

        const product = await prisma.product.create({
            data: {
                name,
                category,
                description,
                make,
                imageUrl
            }
        });
        
        return c.json(product, 201);
    } catch (e) {
        console.error("Create Product Error:", e);
        return c.json({ message: 'Error creating product', error: e.message }, 500);
    }
};

export const updateProduct = async (c) => {
    try {
        const prisma = c.get('prisma');
        const id = c.req.param('id');
        const body = await c.req.parseBody();
        
        const existingProduct = await prisma.product.findUnique({ where: { id } });
        if (!existingProduct) {
            return c.json({ message: 'Product not found' }, 404);
        }

        const name = body.name !== undefined ? body.name : existingProduct.name;
        const category = body.category !== undefined ? body.category : existingProduct.category;
        const description = body.description !== undefined ? body.description : existingProduct.description;
        const make = body.make !== undefined ? body.make : existingProduct.make;
        const file = body.image;
        
        let imageUrl = existingProduct.imageUrl;

        // If a new image is uploaded
        if (file && typeof file !== 'string' && file.size > 0) {
            const buffer = await getBuffer(file);
            const key = `products/${crypto.randomUUID()}-${file.name}`;
            
            if (c.env.BUCKET) {
                // Upload new image to Cloudflare R2
                await c.env.BUCKET.put(key, buffer, {
                    httpMetadata: { contentType: file.type || 'image/jpeg' }
                });
                
                // Optional: delete old image from R2 if it starts with /files/products
                if (existingProduct.imageUrl && existingProduct.imageUrl.startsWith('/files/products/')) {
                    const oldKey = existingProduct.imageUrl.replace('/files/', '');
                    try {
                        await c.env.BUCKET.delete(oldKey);
                    } catch (err) {
                        console.error("Failed to delete old R2 asset:", err);
                    }
                }
                imageUrl = `/files/${key}`;
            } else {
                // Local disk storage fallback
                const fs = await getFs();
                if (fs) {
                    const targetDir = path.join(process.cwd(), 'uploads', 'products');
                    await fs.mkdir(targetDir, { recursive: true });
                    const filePath = path.join(process.cwd(), 'uploads', key);
                    await fs.writeFile(filePath, buffer);
                    
                    // Optional: delete old file from disk
                    if (existingProduct.imageUrl && existingProduct.imageUrl.startsWith('/files/products/')) {
                        const oldFilePath = path.join(process.cwd(), 'uploads', existingProduct.imageUrl.replace('/files/', ''));
                        try {
                            await fs.unlink(oldFilePath);
                        } catch (err) {
                            // ignore missing files
                        }
                    }
                    imageUrl = `/files/${key}`;
                }
            }
        }

        const updatedProduct = await prisma.product.update({
            where: { id },
            data: {
                name,
                category,
                description,
                make,
                imageUrl
            }
        });
        
        return c.json(updatedProduct);
    } catch (e) {
        console.error("Update Product Error:", e);
        return c.json({ message: 'Error updating product', error: e.message }, 500);
    }
};

export const deleteProduct = async (c) => {
    try {
        const prisma = c.get('prisma');
        const id = c.req.param('id');
        
        const existingProduct = await prisma.product.findUnique({ where: { id } });
        if (!existingProduct) {
            return c.json({ message: 'Product not found' }, 404);
        }

        // Clean up images
        if (existingProduct.imageUrl && existingProduct.imageUrl.startsWith('/files/products/')) {
            const key = existingProduct.imageUrl.replace('/files/', '');
            if (c.env.BUCKET) {
                try {
                    await c.env.BUCKET.delete(key);
                } catch (err) {
                    console.error("Failed to delete R2 asset:", err);
                }
            } else {
                const fs = await getFs();
                if (fs) {
                    const filePath = path.join(process.cwd(), 'uploads', key);
                    try {
                        await fs.unlink(filePath);
                    } catch (err) {
                        // ignore missing files
                    }
                }
            }
        }

        await prisma.product.delete({ where: { id } });
        return c.json({ success: true, message: 'Product deleted successfully' });
    } catch (e) {
        console.error("Delete Product Error:", e);
        return c.json({ message: 'Error deleting product', error: e.message }, 500);
    }
};
