import createConnection from "@shared/infra/typeorm";
createConnection();

import express, { NextFunction, Request, Response } from "express";
import "express-async-errors";
import swaggerUi from "swagger-ui-express";
import cors from "cors";

import swaggerFile from "../../../swagger.json";
import "../../container";
import { router } from "./routes";
import { AppError } from "@shared/errors/AppError";
import upload from "@config/upload";
import rateLimiter from "@shared/infra/http/middleware/rateLimiter";

const app = express();
app.use(rateLimiter);

app.use(express.json());
app.use(cors());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerFile));
app.use("/avatar", express.static(`${upload.tmpFolder}/avatar`));
app.use("/avatar", express.static(`${upload.tmpFolder}/cars`));

app.use(router);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            message: err.message,
        });
    }

    return res.status(500).json({
        message: `Internal server error - ${err.message}`,
        status: "error",
    });
});

export { app };
