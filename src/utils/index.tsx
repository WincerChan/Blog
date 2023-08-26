const isBrowser = typeof window !== "undefined";
const formatDate = (date: Date | string) => {
    if (typeof date === 'string') {
        date = new Date(date);
    }
    let options: Intl.DateTimeFormatOptions = {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        timeZone: 'Asia/Shanghai',
    };
    return new Intl.DateTimeFormat('en-US', options).format(date);
}
const padTo32 = (str: string) => {
    if (str.length >= 32) {
        return str.slice(0, 32);
    }
    const paddingLength = 32 - str.length;
    const padding = '0'.repeat(paddingLength);
    return str + padding;
}


const calculateDateDifference = (startDate: Date, lang: string): string => {
    const endDate = new Date();

    let years = endDate.getFullYear() - startDate.getFullYear();
    let months = endDate.getMonth() - startDate.getMonth();

    if (months < 0) {
        years--;
        months += 12;
    }

    let result = "";

    if (years >= 1) {
        if (months === 0) {
            result = ` ${years} ${lang.startsWith('zh') ? '年' : 'year(s)'}`;
        } else {
            result = ` ${years} ${lang.startsWith('zh') ? '年' : 'year(s)'} ${months} ${lang.startsWith('zh') ? '个月' : 'month(s)'}`;
        }
    } else {
        result = ` ${months} ${lang.startsWith('zh') ? '个月' : 'months'}`;
    }

    return result;
}

const shuffle = (array: string[]) => {
    let currentIndex = array.length, randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex != 0) {

        // Pick a remaining element.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }
    return array;
}

type FetchArgs = Parameters<typeof fetch>;

const fetcher = async (url: string) => {
    let ret;
    try {
        const resp = await fetch(url)
        ret = await resp.json()
    } catch (error) {
        console.error(error)
        throw error
        ret = null
    }
    return ret
};

const range = (end: number, step = 1) =>
    Array.from({ length: end }, (_, i) => i * step);


export { calculateDateDifference, fetcher, formatDate, isBrowser, padTo32, range, shuffle };

