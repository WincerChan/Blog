const isBrowser = typeof window !== "undefined";
const formatDate = (date: Date) => {
    let options: Intl.DateTimeFormatOptions = {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        timeZone: 'Asia/Shanghai',
    };
    return new Intl.DateTimeFormat('en-US', options).format(date);
}

export { isBrowser, formatDate };
