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

const calculateDateDifference = (startDate: Date, endDate: Date) => {

    let years = endDate.getFullYear() - startDate.getFullYear();
    let months = endDate.getMonth() - startDate.getMonth();

    if (months < 0) {
        years--;
        months += 12;
    }

    let result = "";

    if (years >= 1) {
        if (months === 0) {
            result = ` ${years} 年`;
        } else {
            result = ` ${years} 年 ${months} 个月`;
        }
    } else {
        result = ` ${months} 个月`;
    }

    return result;
}

type FetchArgs = Parameters<typeof fetch>;

const fetcher = async (url: string) => {
    const resp = await fetch(url)
    return resp.json()
};

const range = (end: number, step = 1) =>
    Array.from({ length: end }, (_, i) => i * step);


export { isBrowser, formatDate, calculateDateDifference, fetcher, range };
