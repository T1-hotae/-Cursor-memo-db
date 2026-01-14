"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Plus, Search, Star, Trash2, Edit3 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

interface Memo {
  id: number
  title: string
  content: string
  starred: boolean
  createdAt: Date
  color: string
}

interface AuthUser {
  id: number
  email: string
  name?: string | null
}

const memoColors = ["bg-secondary", "bg-accent", "bg-primary/10", "bg-chart-4/20"]

export function MemoApp() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [authError, setAuthError] = useState<string | null>(null)
  const [authMode, setAuthMode] = useState<"login" | "register">("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")

  const [memos, setMemos] = useState<Memo[]>([
    {
      id: 1,
      title: "오늘의 할 일",
      content: "프로젝트 미팅 준비하기\n저녁 식사 준비\n운동하기",
      starred: true,
      createdAt: new Date(),
      color: memoColors[0],
    },
    {
      id: 2,
      title: "아이디어 노트",
      content: "새로운 앱 디자인 구상\n밝은 색상 사용하기\n사용자 친화적인 UI 만들기",
      starred: false,
      createdAt: new Date(),
      color: memoColors[1],
    },
    {
      id: 3,
      title: "장보기 목록",
      content: "우유, 계란, 빵\n채소, 과일\n생활용품",
      starred: false,
      createdAt: new Date(),
      color: memoColors[2],
    },
  ])

  const [searchQuery, setSearchQuery] = useState("")
  const [showNewMemo, setShowNewMemo] = useState(false)
  const [newMemoTitle, setNewMemoTitle] = useState("")
  const [newMemoContent, setNewMemoContent] = useState("")
  const [editingMemo, setEditingMemo] = useState<number | null>(null)

  // 현재 로그인 사용자 정보 가져오기
  useEffect(() => {
    const fetchMe = async () => {
      try {
        setAuthLoading(true)
        const res = await fetch("/api/auth/me")
        if (!res.ok) {
          setUser(null)
          return
        }
        const data = await res.json()
        setUser(data.user)
      } catch {
        setUser(null)
      } finally {
        setAuthLoading(false)
      }
    }
    fetchMe()
  }, [])

  const filteredMemos = memos.filter(
    (memo) =>
      memo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      memo.content.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleAddMemo = () => {
    if (newMemoTitle.trim() || newMemoContent.trim()) {
      const newMemo: Memo = {
        id: Date.now(),
        title: newMemoTitle || "제목 없음",
        content: newMemoContent,
        starred: false,
        createdAt: new Date(),
        color: memoColors[Math.floor(Math.random() * memoColors.length)],
      }
      setMemos([newMemo, ...memos])
      setNewMemoTitle("")
      setNewMemoContent("")
      setShowNewMemo(false)
    }
  }

  const handleDeleteMemo = (id: number) => {
    setMemos(memos.filter((memo) => memo.id !== id))
  }

  const handleToggleStar = (id: number) => {
    setMemos(memos.map((memo) => (memo.id === id ? { ...memo, starred: !memo.starred } : memo)))
  }

  const handleAuthSubmit = async () => {
    try {
      setAuthError(null)
      setAuthLoading(true)
      const endpoint = authMode === "login" ? "/api/auth/login" : "/api/auth/register"
      const body: Record<string, string> = { email, password }
      if (authMode === "register" && name.trim()) {
        body.name = name.trim()
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      const data = await res.json()
      if (!res.ok) {
        setAuthError(data.message ?? "오류가 발생했습니다.")
        return
      }

      setUser(data.user)
      setPassword("")
    } catch {
      setAuthError("서버와 통신 중 오류가 발생했습니다.")
    } finally {
      setAuthLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      setAuthLoading(true)
      await fetch("/api/auth/logout", { method: "POST" })
      setUser(null)
    } finally {
      setAuthLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl p-4 md:p-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-4xl font-bold text-foreground">{"메모"}</h1>
            <p className="text-lg text-muted-foreground">{"당신의 생각을 기록하세요"}</p>
          </div>
          {user && (
            <div className="flex items-center gap-3">
              <div className="text-right text-sm">
                <div className="font-semibold">{user.email}</div>
                {user.name && <div className="text-muted-foreground">{user.name}</div>}
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout} disabled={authLoading}>
                {authLoading ? "처리 중..." : "로그아웃"}
              </Button>
            </div>
          )}
        </div>

        {/* Auth Section */}
        {!user && (
          <div className="flex min-h-[320px] items-center justify-center">
            <Card className="w-full max-w-md p-6 shadow-lg">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex gap-2">
                  <Button
                    variant={authMode === "login" ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setAuthMode("login")
                      setAuthError(null)
                    }}
                  >
                    로그인
                  </Button>
                  <Button
                    variant={authMode === "register" ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setAuthMode("register")
                      setAuthError(null)
                    }}
                  >
                    회원가입
                  </Button>
                </div>
                {authLoading && <span className="text-xs text-muted-foreground">처리 중...</span>}
              </div>

              <div className="space-y-4">
                {authMode === "register" && (
                  <Input
                    type="text"
                    placeholder="이름 (선택)"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                )}
                <Input
                  type="email"
                  placeholder="이메일"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
                <Input
                  type="password"
                  placeholder="비밀번호"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={authMode === "login" ? "current-password" : "new-password"}
                />
                {authError && <p className="text-sm text-destructive">{authError}</p>}
                <Button className="w-full" onClick={handleAuthSubmit} disabled={authLoading}>
                  {authMode === "login" ? "로그인" : "회원가입"}
                </Button>
                <p className="text-center text-xs text-muted-foreground">
                  로그인하면 이 브라우저에 세션 쿠키가 저장됩니다.
                </p>
              </div>
            </Card>
          </div>
        )}

        {/* Memo App (only when logged in) */}
        {user && (
          <>
            {/* Search and Add */}
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="relative flex-1 md:max-w-md">
                <Search className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="메모 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button size="lg" className="gap-2" onClick={() => setShowNewMemo(!showNewMemo)}>
                <Plus className="size-5" />
                {"새 메모"}
              </Button>
            </div>

            {/* New Memo Form */}
            {showNewMemo && (
              <Card className="mb-6 p-6 shadow-lg">
                <div className="space-y-4">
                  <Input
                    type="text"
                    placeholder="제목을 입력하세요..."
                    value={newMemoTitle}
                    onChange={(e) => setNewMemoTitle(e.target.value)}
                    className="text-lg font-semibold"
                  />
                  <Textarea
                    placeholder="내용을 입력하세요..."
                    value={newMemoContent}
                    onChange={(e) => setNewMemoContent(e.target.value)}
                    className="min-h-32 resize-none"
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowNewMemo(false)
                        setNewMemoTitle("")
                        setNewMemoContent("")
                      }}
                    >
                      {"취소"}
                    </Button>
                    <Button onClick={handleAddMemo}>{"저장"}</Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Memos Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredMemos.map((memo) => (
                <Card
                  key={memo.id}
                  className={`group relative overflow-hidden p-6 transition-all hover:shadow-xl ${memo.color}`}
                >
                  <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button size="icon" variant="ghost" className="size-8" onClick={() => handleToggleStar(memo.id)}>
                      <Star
                        className={`size-4 ${memo.starred ? "fill-primary text-primary" : "text-muted-foreground"}`}
                      />
                    </Button>
                    <Button size="icon" variant="ghost" className="size-8" onClick={() => setEditingMemo(memo.id)}>
                      <Edit3 className="size-4 text-muted-foreground" />
                    </Button>
                    <Button size="icon" variant="ghost" className="size-8" onClick={() => handleDeleteMemo(memo.id)}>
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>

                  <div className="space-y-3">
                    <h3 className="pr-12 text-xl font-bold text-card-foreground">{memo.title}</h3>
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-card-foreground/80">
                      {memo.content}
                    </p>
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-xs text-muted-foreground">
                        {memo.createdAt.toLocaleDateString("ko-KR")}
                      </span>
                      {memo.starred && <Star className="size-4 fill-primary text-primary" />}
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {filteredMemos.length === 0 && (
              <div className="flex min-h-64 flex-col items-center justify-center text-center">
                <div className="mb-4 rounded-full bg-muted p-6">
                  <Search className="size-12 text-muted-foreground" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-foreground">{"메모가 없습니다"}</h3>
                <p className="text-muted-foreground">
                  {searchQuery ? "검색 결과가 없습니다" : "새로운 메모를 작성해보세요"}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
