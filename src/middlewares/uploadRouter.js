import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { generateSub } from '../utils/generateSub.js';

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        try {

            const { name } = req.body;

            const sub = generateSub(name)

            const folderPath = path.join(process.cwd(), 'routers', sub);

            // Crea el directorio si no existe
            fs.mkdirSync(folderPath, { recursive: true });

            // Adjunta el sub al request para usarlo después
            req.sub = sub;

            cb(null, folderPath);
        } catch (err) {
            cb(err, null);
        }
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        const fileName = `${Date.now()}${ext}`;
        cb(null, fileName);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/png', 'image/jpg', 'image/jpeg', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Formato de imagen no permitido'), false);
    }
};

export const uploadPhoto = multer({ storage, fileFilter });