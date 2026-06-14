import path from 'node:path';

// Dynamic fs import for local file system operations (safely bypassed on Cloudflare Workers)
async function getFs() {
    try {
        return await import('node:fs/promises');
    } catch (e) {
        return null;
    }
}

// Simple mime type resolver
function getMimeType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const map = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.pdf': 'application/pdf',
        '.doc': 'application/msword',
        '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    };
    return map[ext] || 'application/octet-stream';
}

export const getFile = async (c) => {
    try {
        const prisma = c.get('prisma');
        const wildPath = c.req.param('*');
        const id = c.req.param('id');
        const filepath = wildPath || id;

        if (!filepath) {
            return c.json({ message: 'No file specified' }, 400);
        }

        // 1. Check if the path points directly to an asset key (like products/ or profiles/)
        const hasSlashes = filepath.includes('/');
        
        if (hasSlashes) {
            // Serve directly from R2
            if (c.env.BUCKET) {
                const object = await c.env.BUCKET.get(filepath);
                if (object) {
                    const fileData = await object.arrayBuffer();
                    const mimeType = object.httpMetadata?.contentType || getMimeType(filepath);
                    return c.body(fileData, 200, {
                        'Content-Type': mimeType,
                        'Content-Disposition': `inline; filename="${path.basename(filepath)}"`
                    });
                }
            } else {
                // Local disk storage fallback
                const fs = await getFs();
                if (fs) {
                    const localPath = path.join(process.cwd(), 'uploads', filepath);
                    try {
                        const fileData = await fs.readFile(localPath);
                        return c.body(fileData, 200, {
                            'Content-Type': getMimeType(filepath),
                            'Content-Disposition': `inline; filename="${path.basename(filepath)}"`
                        });
                    } catch (err) {
                        // File not found locally
                    }
                }
            }
            return c.json({ message: 'File not found in storage' }, 404);
        }

        // 2. Otherwise, treat as a Document database ID (like a CUID)
        const doc = await prisma.document.findUnique({ where: { id: filepath } });
        if (!doc) {
            // Fallback: Check if the ID itself exists directly in R2/local uploads folder
            if (c.env.BUCKET) {
                const object = await c.env.BUCKET.get(filepath);
                if (object) {
                    const fileData = await object.arrayBuffer();
                    const mimeType = object.httpMetadata?.contentType || getMimeType(filepath);
                    return c.body(fileData, 200, {
                        'Content-Type': mimeType,
                        'Content-Disposition': `inline; filename="${filepath}"`
                    });
                }
            } else {
                const fs = await getFs();
                if (fs) {
                    const localPath = path.join(process.cwd(), 'uploads', filepath);
                    try {
                        const fileData = await fs.readFile(localPath);
                        return c.body(fileData, 200, {
                            'Content-Type': getMimeType(filepath),
                            'Content-Disposition': `inline; filename="${filepath}"`
                        });
                    } catch (err) {
                        // ignore
                    }
                }
            }
            return c.json({ message: 'Document not found' }, 404);
        }

        // Serve document from R2/local path using doc.url
        if (doc.url) {
            if (c.env.BUCKET) {
                const object = await c.env.BUCKET.get(doc.url);
                if (object) {
                    const fileData = await object.arrayBuffer();
                    const mimeType = object.httpMetadata?.contentType || doc.mimeType;
                    return c.body(fileData, 200, {
                        'Content-Type': mimeType,
                        'Content-Disposition': `inline; filename="${doc.filename}"`
                    });
                }
            } else {
                const fs = await getFs();
                if (fs) {
                    const localPath = path.join(process.cwd(), 'uploads', doc.url);
                    try {
                        const fileData = await fs.readFile(localPath);
                        return c.body(fileData, 200, {
                            'Content-Type': doc.mimeType,
                            'Content-Disposition': `inline; filename="${doc.filename}"`
                        });
                    } catch (err) {
                        // ignore
                    }
                }
            }
        }

        return c.json({ message: 'File data not found in storage' }, 404);
    } catch (e) {
        console.error('Error fetching file:', e);
        return c.json({ message: 'Error fetching file', error: e.message }, 500);
    }
};

