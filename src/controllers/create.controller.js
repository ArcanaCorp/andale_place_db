import pool from "../db/db.js"
import fs from 'fs';
import path from 'path';
import xlsx from 'xlsx';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { generateSub } from "../utils/generateSub.js";

export const controllerCreateRouter = async (req, res) => {

    const { name, text } = req.body

    try {

        if (!req.file) return res.status(404).json({ok: false, message: 'No se subió ninguna imagen', error: 'NOT_UPLOADED_IMAGE', code: 404})

            const fileUrl = `${req.file.filename}`;
            const sub = generateSub(name);
            const sql = `INSERT INTO routes_places (sub_router, name_router, text_router, image_router, created_router) VALUES (?, ?, ?, ?, NOW())`
            const [ result ] = await pool.query(sql, [sub, name, text, fileUrl])

            if (result.affectedRows === 0) return res.status(403).json({ok: false, message: 'No se pudo guardar la ruta', error: 'ERR_NOT_SAVED_ROUTER', code: 403})

                const url = `http://localhost:5000/api/v1/routes/image/${sub}/${fileUrl}`;
                return res.status(201).json({ok: true, message: 'Se guardó la ruta correctamente', code: 201, data: {sub, name, text, image: url}, error: ''})

    } catch (error) {
        return res.status(500).json({ok: false, message: `Error: ${error.message}`, error: error, code: 500})
    }

}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const controllerCreatePlace = async (req, res) => {
    try {

        
        // Ruta al archivo Excel dentro de la misma carpeta del controlador
        const filePath = path.join(__dirname, 'data.xlsx');

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ message: 'Archivo Excel "turistico.xls" no encontrado' });
        }
        

        // Leer el Excel
        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const rawData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });
        const rows = rawData.slice(1); // las demás filas
        
        // Mapear filas manualmente a objetos
        const data = rows.map(row => ({
            nombre: row[1],           // __EMPTY_1
            categoria: row[2],        // __EMPTY_2
            departamento: row[5],     // __EMPTY_5
            provincia: row[6],        // __EMPTY_6
            distrito: row[7],         // __EMPTY_7
        }));
        
        // Procesar los datos
        for (const row of data) {

            const { nombre, categoria, departamento, provincia, distrito } = row;        

            if (!nombre || typeof nombre !== 'string' || nombre === 'Nombre') {
                console.warn('Fila ignorada: nombre inválido', row);
                continue;
            }

            const categ = categoria.replace(/^\d+\.\s*/, '');

            const sub = generateSub(nombre)
            
            // Unir ubicación
            const locationName = ` ${distrito}, ${provincia}, ${departamento}`;

            const sql = "INSERT INTO places (sub_place,name_place,text_place,category_place,locationName_place,location_place,services_place,schedule_place,price_place,access_place,recommended_time,activities_place,created_place) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())"; 
            await pool.query(sql, [sub || '', nombre || '', '', categ || '', locationName || '', '', '{}', '', '', '{}', '', '{}']);

        }

        return res.status(200).json({ message: 'Lugares creados exitosamente desde el Excel.' });

    } catch (error) {
        console.error('Error al crear lugares:', error);
        return res.status(500).json({ message: 'Error del servidor al procesar el archivo Excel' });
    }
}