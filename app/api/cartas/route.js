import { NextResponse } from 'next/server';
import { listarCartas } from '../../../lib/cartas';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({ cartas: listarCartas() });
}
