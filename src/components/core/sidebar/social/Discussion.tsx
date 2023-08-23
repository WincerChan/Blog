const NavigateComment = () => {
    const click = () => {
        document.getElementById('gisdus')?.scrollIntoView({ behavior: "smooth" })
    }
    return (
        <button onClick={click} title="Translate" class=":: hover:text-emerald-500 focus:text-emerald-500 relative trans-linear h-15 w-24 <lg:hidden ">
            <i class=":: i-carbon-add-comment w-9 h-9 " />
        </button>
    )
}

export default NavigateComment