import { Button, TextField } from "@material-ui/core"

export default function ActionsBox({
    currentSequence,
    selectedSeq,
    disableNewSeq,
    disableReset,
    disableNodeRemove,
    disableLinkRemove,
    disableGetLink,
    reverseSequenceAction,
    newSequenceAction,
    removeNodesAction,
    resetMapAction,
    removeLinksAction,
    updateLinksAction,
    selectSequenceAction
}){
    const buttonProps = { variant: 'contained', color: 'primary', size: 'small' }
    return (
        <div className="map-options">
            <form className="reverse-seq-input" noValidate autoComplete="off">
                <TextField
                    label="Current Segment" InputProps={{readOnly: true,}}
                    value={"Current Segment #" + currentSequence}
                />
                <TextField
                    label="Reverse Seg #" value={selectedSeq}
                    onChange={selectSequenceAction} variant="filled"
                />
            </form>
            <Button id='reverseSeq-button' {...buttonProps}
                disabled={disableNewSeq}
                onClick={reverseSequenceAction}
            >
                Reverse
            </Button>
            <Button id='newSeq-button' {...buttonProps}
                disabled={disableNewSeq}
                onClick={newSequenceAction}
            >
                New Segment
            </Button>
            <Button id='reset-button' {...buttonProps}
                disabled={disableReset}
                onClick={resetMapAction}
            >
                Reset Map
            </Button>
            <Button id='remove-node-button' {...buttonProps}
                disabled={disableNodeRemove}
                onClick={removeNodesAction}
            >
                Remove Last Node
            </Button>
            <Button id='remove-links-button' {...buttonProps}
                disabled={disableLinkRemove}
                onClick={removeLinksAction}
            >
                Remove All Links
            </Button>
            <Button id='link-button' {...buttonProps}
                disabled={disableGetLink}
                onClick={updateLinksAction}
            >
                Update & Display Links
            </Button>
        </div>
    )
}