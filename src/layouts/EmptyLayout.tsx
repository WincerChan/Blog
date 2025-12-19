const EmptyLayout = () => {
    return (
        <div class="h-screen flex flex-col">
            <header class="h-14 w-full <sm:h-28 bg-gray-2 animate-pulse mb-10 <md:mb-8"></header>
            <main class="w-view flex-grow bg-gray-2 animate-pulse"></main>
            <footer class="h-32 w-full bg-gray-2 animate-pulse mt-8"></footer>
        </div>
    )
}

export default EmptyLayout;
