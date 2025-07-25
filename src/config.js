import { config } from "dotenv";

config();

export const {
  PORT,
  HOST_DB,
  USER_DB,
  PASSWORD_DB,
  PORT_DB,
  DATABASE_DB,
  JWT_SECRET,
  NODE_ENV,
} = process.env;