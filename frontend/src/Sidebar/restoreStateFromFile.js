export function restoreStateFromFile(fileDropEvent){
    fileDropEvent.stopPropagation()
    fileDropEvent.preventDefault()
    // only handle one at a time
    let file = fileDropEvent.dataTransfer.files[0]
    console.log(file)
    if( ! file.type == 'application/json' ) { return }
    let reader = new FileReader()
    reader.onload = e => { console.log(JSON.parse(e.target.result)) }
    reader.readAsText(file)
}