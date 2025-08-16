// app/api/excel/route.ts
import * as XLSX from "xlsx";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// رابط Google Sheet مباشر بصيغة XLSX
const EXCEL_URL =
  "https://docs.google.com/spreadsheets/d/1fF9BUgBcW9OW3nWT97Uke_z2Pq3y_LC0/export?format=xlsx&gid=146224510";

export async function GET() {
  try {
    console.log("[API] تحميل أحدث نسخة من ملف Excel...");

    // إضافة timestamp لتجنب الكاش
    const res = await fetch(`${EXCEL_URL}&t=${Date.now()}`, { cache: "no-store" });
    if (!res.ok) throw new Error(`فشل التحميل (status: ${res.status})`);

    const buffer = await res.arrayBuffer();

    // قراءة الملف باستخدام XLSX
    const workbook = XLSX.read(Buffer.from(buffer), { type: "buffer" });

    console.log("[API] الأوراق الموجودة:", workbook.SheetNames);

    const allSheets: any = {};

    workbook.SheetNames.forEach((sheetName) => {
      const worksheet = workbook.Sheets[sheetName];
      const rows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });

      if (rows.length > 0) {
        const headers = rows[0];
        const data = rows.slice(1).map((row) =>
          Object.fromEntries(headers.map((h: string, i: number) => [h, row[i] ?? ""]))
        );
        allSheets[sheetName] = { headers, totalRows: data.length, data };
      } else {
        allSheets[sheetName] = { headers: [], totalRows: 0, data: [] };
      }
    });

    return NextResponse.json(allSheets);
  } catch (err: any) {
    console.error("[API] خطأ:", err);
    return NextResponse.json(
      { error: err.message || "حدث خطأ أثناء قراءة ملف Excel" },
      { status: 500 }
    );
  }
}
