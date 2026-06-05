import { Fragment, useState } from "react";
import { Dialog, DialogContent } from "@mui/material";
import { AiOutlineShareAlt, AiFillLinkedin, AiFillInstagram, AiFillGithub, AiFillFacebook } from 'react-icons/ai';

export default function ShareDialogBox() {
    const [open, setOpen] = useState(false);

    return (
        <Fragment>
            <div className="ml-auto cursor-pointer" onClick={() => setOpen(true)}>
                <AiOutlineShareAlt style={{ color: 'white' }} size={20} />
            </div>
            <Dialog open={open} onClose={() => setOpen(false)}>
                <DialogContent>
                    <div className="bg-gray-800 rounded-lg p-4">
                        <div className="flex justify-center gap-3 mt-2 mb-2">
                            <a href="#"><AiFillLinkedin size={35} color="white" /></a>
                            <a href="#"><AiFillInstagram size={35} color="white" /></a>
                            <a href="#"><AiFillGithub size={35} color="white" /></a>
                            <a href="#"><AiFillFacebook size={35} color="white" /></a>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </Fragment>
    );
}