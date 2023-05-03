const Seprator = ({ title }: { title: string }) => {
    return (
        <>
            <div class="flex mb-4">
                <div class="w-8 flex-none bg-[var(--subtitle)]  h-2px"></div>
                <div class="flex-grow bg-[var(--menu-hover-bg)] h-2px"></div>
            </div>
            <h3 class="text-base font-headline text-[var(--subtitle)]">{title}</h3>
        </>
    )
}

export default Seprator;