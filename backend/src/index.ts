import { Request, Response, NextFunction } from 'express';
import express from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import dotenv from 'dotenv';
import cors from 'cors';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

dotenv.config();
const prisma = new PrismaClient();

export const app = express();
export default prisma;

const port = 3010;

app.use(
  cors({
    origin: 'http://localhost:3000',
  })
);

const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'cvs');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const allowedCvMimeTypes = new Set<string>([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

const allowedCvExtensions = new Set<string>(['.pdf', '.docx']);

const INVALID_CV_FORMAT_MESSAGE =
  'El formato del CV no es válido. Solo se permiten PDF o DOCX.';

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeExt = allowedCvExtensions.has(ext) ? ext : '';
    const filename = `${crypto.randomUUID()}${safeExt}`;
    cb(null, filename);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const isAllowedByMime = allowedCvMimeTypes.has(file.mimetype);
    const isAllowedByExt = allowedCvExtensions.has(ext);

    if (isAllowedByMime || isAllowedByExt) {
      return cb(null, true);
    }

    cb(new Error(INVALID_CV_FORMAT_MESSAGE));
  },
});

app.get('/', (req, res) => {
  res.send('Hola LTI!');
});

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isValidEmail(value: string): boolean {
  // Regex simple y suficiente para validación de formato en UI/backend.
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

app.post(
  '/api/candidates',
  upload.single('cv'),
  async (req: Request, res: Response) => {
    const body = req.body as Record<string, unknown>;
    const errors: Record<string, string> = {};

    const requiredStringFields = [
      'firstName',
      'lastName',
      'email',
      'phone',
      'address',
      'education',
      'workExperience',
    ];

    for (const field of requiredStringFields) {
      if (!isNonEmptyString(body[field])) {
        errors[field] = `El campo '${field}' es obligatorio.`;
      }
    }

    const email = isNonEmptyString(body.email) ? body.email : '';
    if (email && !isValidEmail(email)) {
      errors.email = 'El email no tiene un formato válido.';
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        message: 'La validación falló.',
        errors,
      });
    }

    const cv =
      req.file != null
        ? {
            cvOriginalName: req.file.originalname,
            cvMimeType: req.file.mimetype,
            cvSizeBytes: req.file.size,
            cvStoredPath: `uploads/cvs/${req.file.filename}`,
            cvUploadedAt: new Date(),
          }
        : {};

    try {
      const candidate = await prisma.candidate.create({
        data: {
          firstName: body.firstName as string,
          lastName: body.lastName as string,
          email: body.email as string,
          phone: body.phone as string,
          address: body.address as string,
          education: body.education as string,
          workExperience: body.workExperience as string,
          ...cv,
        },
        select: {
          id: true,
        },
      });

      return res.status(201).json({
        message: 'Candidato creado con éxito.',
        id: candidate.id,
      });
    } catch (err: any) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2002'
      ) {
        return res.status(409).json({
          message: 'Ya existe un candidato con ese correo electrónico.',
        });
      }

      console.error(err);
      return res.status(500).json({
        message: 'Internal server error.',
      });
    }
  }
);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  if (res.headersSent) {
    return next(err);
  }

  // Multer: tamaño excedido
  if (err?.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      message: 'El CV no puede superar 5MB.',
    });
  }

  // Multer: formato inválido (fileFilter)
  if (typeof err?.message === 'string' && err.message === INVALID_CV_FORMAT_MESSAGE) {
    return res.status(400).json({
      message: err.message,
    });
  }

  return res.status(500).json({
    message: 'Something broke!',
  });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
  });
}
