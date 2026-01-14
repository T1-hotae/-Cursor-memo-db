import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ user: null }, { status: 200 })
    }
    return NextResponse.json({ user })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: "사용자 정보를 불러오는 중 오류가 발생했습니다." }, { status: 500 })
  }
}


