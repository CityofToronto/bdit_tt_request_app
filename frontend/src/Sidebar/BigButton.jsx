export default function BigButton({onClick,children}){
    return (
        <div className='bigButton' onClick={onClick}>{children}</div>
    )
}