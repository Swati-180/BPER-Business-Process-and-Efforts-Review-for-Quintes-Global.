import { z } from 'zod';

export const formSchema = z.object({
  processRows: z.array(z.object({
    majorProcess: z.string().min(1, 'Major Process required'),
    process: z.string().min(1, 'Process required'),
    subProcess: z.string().min(1, 'Sub Process required'),
    frequency: z.string().min(1),
    vol: z.number().min(0, 'Volume cannot be negative'),
    hrs: z.number().min(1, 'Hours must be > 0'),
    appUsed: z.string().optional()
  })),
  miscRows: z.array(z.object({
    description: z.string().optional(),
    hrs: z.number().min(1, 'Hours must be > 0').optional(),
    isMapping: z.boolean().optional(),
    aiSuggestion: z.any().optional()
  })).refine((rows) => rows.some(row => row.hrs && row.hrs > 0), {
    message: 'At least one activity with hours required'
  }),
  month: z.string().min(1),
  year: z.number().min(2000)
});

export type FormData = z.infer<typeof formSchema>;

