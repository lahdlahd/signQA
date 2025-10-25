import { NextRequest, NextResponse } from "next/server";

import {
  getQuestionsWithFilters,
  parseFiltersFromSearchParams
} from "@/lib/filtering";

export function GET(request: NextRequest) {
  const filters = parseFiltersFromSearchParams(request.nextUrl.searchParams);
  const { filtered, summary } = getQuestionsWithFilters(filters);

  return NextResponse.json({
    filters,
    summary,
    questions: filtered
  });
}
