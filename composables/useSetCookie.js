export const useSetCookie = (name, maxHour = 1) => {
    // 可以統一設置 secure、httpOnly 等 options
    const cookie = useCookie(name, {
        maxAge: 60 * 60 * maxHour, // 1 小時
        secure: false, // 若僅限 HTTPS 要設 true
        httpOnly: false, // 只允許伺服器端讀取
        path: '/', // 路徑
        sameSite: true, // 限制同站
    })
    return cookie
}