export default function CreateFactorButton({onClick,children}){
    return (
        <div className='bigButton' onClick={onClick}>{children}</div>
    )
}