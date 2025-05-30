export function binAge(age) {
    if (age >= 20 && age < 30) return 0;
    if (age >= 30 && age < 40) return 1;
    if (age >= 40 && age < 50) return 2;
    if (age >= 50 && age < 60) return 3;
    if (age >= 60 && age < 70) return 4;
    return 999;
}
  
export function binStmtLen(stmt_len) {
    if (stmt_len == 0) return 0;
    if (stmt_len > 0 && stmt_len < 130) return 1;
    if (stmt_len >= 130 && stmt_len < 650) return 2;
    if (stmt_len >= 650 && stmt_len < 1300) return 3;
    if (stmt_len > 1300) return 4;
}
  
export function binDate(date) {
    if (isNaN(date)) return "Unknown";
    const year = date.getFullYear();
    if (year >= 1980 && year < 1990) return 0;
    if (year >= 1990 && year < 2000) return 1;
    if (year >= 2000 && year < 2010) return 2;
    if (year >= 2010 && year < 2020) return 3;
    return 999;
}

