import { NextResponse } from 'next/server'
import axios from 'axios'



export async function POST(request: Request) {
  try {
    const body = await request.json()
    const res = await axios.post('https://script.google.com/macros/s/AKfycbyO1YvRhGT92uK_n8XG7rsUz2zbQnqcvGgOgBIR27RUiAH0_0cR-XlEpROOtqi3M0J_/exec', body)
    return new NextResponse(JSON.stringify(res.data), { status: res.status })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
