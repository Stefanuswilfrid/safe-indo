import { PrismaClient, HoaxFactCheck as PrismaHoaxFactCheck } from '@prisma/client';
import { Redis } from '@upstash/redis';
import OpenAI from 'openai';
import { createHash } from 'crypto';
import type { HoaxFactCheck } from './hoax-content-parser';

