import { Fragment, useState } from "react";
import { Dialog, DialogContent } from "@mui/material";
import { AiOutlineSearch } from "react-icons/ai";

export default function SearchDialog() {
    const [open, setOpen] = useState(false);
    const [searchkey, setSearchkey] = useState("");

    return (
        <Fragment>
            <div onClick={() => setOpen(true)} className="cursor-pointer">
                <AiOutlineSearch size={20} color="white" />
            </div>
            <Dialog open={open} onClose={() => setOpen(false)}>
                <DialogContent>
                    <div className="bg-gray-800 rounded-lg p-4 min-w-[280px]">
                        <input
                            type="search"
                            placeholder="Type here..."
                            value={searchkey}
                            onChange={(e) => setSearchkey(e.target.value)}
                            className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-400"
                        />
                    </div>
                </DialogContent>
            </Dialog>
        </Fragment>
    );
}
