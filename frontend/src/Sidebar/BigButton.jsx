export default function BigButton({children,...props}){
    return (
        <div className='bigButton' {...props}>
            {children}
        </div>
    )
}