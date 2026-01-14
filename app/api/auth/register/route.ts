import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { setAuthCookie } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ message: "이메일과 비밀번호를 입력해주세요." }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ message: "이미 가입된 이메일입니다." }, { status: 409 })
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
      },
    })

    await setAuthCookie({ id: user.id, email: user.email })

    return NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          createdAt: user.createdAt,
        },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: "회원가입 중 오류가 발생했습니다." }, { status: 500 })
  }
}


