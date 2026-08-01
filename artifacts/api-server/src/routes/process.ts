import { Router, type IRouter } from "express";
import { processText } from "../lib/textProcessor";
import { ProcessTextBody, ProcessTextResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.post("/process", async (req, res): Promise<void> => {
  const parsed = ProcessTextBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const result = processText(parsed.data.text);
  res.json(ProcessTextResponse.parse(result));
});

export default router;
