export function binAge(age) {
    if (age >= 20 && age < 30) return 0;
    if (age >= 30 && age < 40) return 1;
    if (age >= 40 && age < 50) return 2;
    if (age >= 50 && age < 60) return 3;
    if (age >= 60 && age < 70) return 4;
    return 999;
}
  
export function binStmtLen(stmt_len, statement) {
    var word_lngth = getWordCount(statement)
    if (stmt_len == 0) {return 0} 
    else {
        if (word_lngth > 0 && word_lngth < 65) return 1;
        if (word_lngth >= 65 && word_lngth < 130) return 2;
        if (word_lngth >= 130 && word_lngth < 650) return 3;
        if (word_lngth >= 650 && word_lngth < 1300) return 4;
    };
    
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

function getWordCount(statement) {
    // if (typeof statement !== "string") return 0;
    const words = statement.trim().split(/\s+/);
    const word_len = words.filter(word => word.length > 0).length; // Filter out any empty strings and return the length
    return word_len
  }

