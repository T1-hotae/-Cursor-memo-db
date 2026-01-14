import { NextResponse } from "next/server"
import { clearAuthCookie } from "@/lib/auth"

export async function POST() {
  try {
    await clearAuthCookie()
    return NextResponse.json({ message: "로그아웃되었습니다." })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: "로그아웃 중 오류가 발생했습니다." }, { status: 500 })
  }
}


