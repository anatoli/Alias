import React from "react";
import '../../App.css';
import '../BodyComponent.css';

import './index.css'


import {createStyles, Theme, withStyles, WithStyles} from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import MuiDialogContent from '@material-ui/core/DialogContent';
import MuiDialogActions from '@material-ui/core/DialogActions';
import Typography from '@material-ui/core/Typography';

const styles = (theme: Theme) =>
    createStyles({
        root: {
            margin: 0,
            padding: theme.spacing(4),
            background: 'transparent',
            paddingBottom: theme.spacing(2),
            textAlign: 'center' as const,
        },
        closeButton: {
            position: 'absolute',
            right: theme.spacing(1),
            top: theme.spacing(1),
            color: theme.palette.grey[500],
        },
    });

export interface DialogTitleProps extends WithStyles<typeof styles> {
    id: string;
    children: React.ReactNode;
}

const DialogTitle = withStyles(styles)((props: DialogTitleProps) => {
    const { children, classes, ...other } = props;
    return (
        <MuiDialogTitle disableTypography className={classes.root} {...other}>
            <Typography variant="h3">{children}</Typography>
        </MuiDialogTitle>
    );
});

const DialogContent = withStyles((theme: Theme) => ({
    root: {
        padding: theme.spacing(2),
        background: 'transparent',
        textAlign: 'center' as const,
    },
}))(MuiDialogContent);

const DialogActions = withStyles((theme: Theme) => ({
    root: {
        margin: 0,
        padding: theme.spacing(2),
        background: 'transparent',
        justifyContent: 'center',
    },
}))(MuiDialogActions);



interface ModalWindowProps {
    onFinishModalWindow?:(any),
    open: boolean,
    message: string,
    title: string,
}

interface ModalWindowState {
        isOpen: boolean
}

class ModalWindowComponent extends React.PureComponent <ModalWindowProps, ModalWindowState> {
    constructor(props:any) {
        super(props);

        this.state = {
            isOpen: false
        }
    }

    componentDidMount() {
    }


    componentDidUpdate(prevProps: Readonly<ModalWindowProps>, prevState: Readonly<ModalWindowState>, snapshot?: any) {
        if(this.props.open){
            this.setState({isOpen: true})
        }

    }

    handleClickOpen = () => {
        this.setState({isOpen:true});
    };
    handleClose = () => {
        this.setState({isOpen:false});
        this.props.onFinishModalWindow()
    };

    render() {

        return(
            <div>
                <Dialog
                    onClose={this.handleClose}
                    aria-labelledby="customized-dialog-title"
                    open={this.state.isOpen}
                    PaperProps={{ className: 'winner-modal-paper' }}
                >
                    <DialogTitle id='modal-title-id' children={this.props.title}></DialogTitle>
                    <DialogContent dividers>
                        <Typography gutterBottom variant="h3">
                            {this.props.message}
                        </Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button autoFocus onClick={this.handleClose} color="primary">
                            Close
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        )
    }
}

export default ModalWindowComponent;

