/**
 * 台灣身分證驗證函數
 * 根據維基百科：https://zh.wikipedia.org/zh-tw/中華民國國民身分證#驗證規則
 * @param {string} idCard - 身分證字號 (格式: A123456789)
 * @returns {boolean} - 驗證是否通過
 */
export function validateTaiwanIdCard(idCard) {
  if (!idCard || typeof idCard !== 'string') {
    return false
  }

  // 字母對應數字值
  const letterMap = {
    A: 10, // 台北市
    B: 11, // 台中市
    C: 12, // 基隆市
    D: 13, // 台南市
    E: 14, // 高雄市
    F: 15, // 新北市
    G: 16, // 宜蘭縣
    H: 17, // 桃園市
    I: 34, // 嘉義市
    J: 18, // 新竹縣
    K: 19, // 苗栗縣
    M: 21, // 南投縣
    N: 22, // 彰化縣
    O: 35, // 新竹市
    P: 23, // 雲林縣
    Q: 24, // 嘉義縣
    T: 27, // 屏東縣
    U: 28, // 花蓮縣
    V: 29, // 台東縣
    W: 32, // 金門縣
    X: 30, // 澎湖縣
    Z: 33, // 連江縣
    L: 20, // 台中縣 (停止)
    R: 25, // 台南縣 (停止)
    S: 26, // 高雄縣 (停止)
    Y: 31, // 陽明山管理局 (停止)
  }

  // 取得首字母
  const firstLetter = idCard.charAt(0).toUpperCase()
  const letterValue = letterMap[firstLetter]

  if (!letterValue) {
    return false
  }

  // 取得字母對應數值的十位數和個位數
  const tensDigit = Math.floor(letterValue / 10)
  const onesDigit = letterValue % 10

  // 取得後9位數字
  const digits = idCard.substring(1)
  if (digits.length !== 9 || !/^\d{9}$/.test(digits)) {
    return false
  }

  // 權重陣列：十位數*1, 個位數*9, 第2-9位分別乘以8,7,6,5,4,3,2,1, 第10位*1
  const weights = [1, 9, 8, 7, 6, 5, 4, 3, 2, 1, 1]

  // 計算總和
  let sum = tensDigit * weights[0] + onesDigit * weights[1]
  for (let i = 0; i < 9; i++) {
    sum += parseInt(digits[i], 10) * weights[i + 2]
  }

  // 檢查總和是否能被10整除
  return sum % 10 === 0
}
