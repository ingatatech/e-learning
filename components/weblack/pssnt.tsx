"use client"
import { useState, useEffect } from "react"
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogTrigger } from "../ui/dialog"
interface ChildProps {onComplete: (score: number, passed: boolean) => void;}
export function Pssnt( { onComplete }: ChildProps ) {
const [doIt, 
setDoIt] = 
useState(false)
useEffect(() => {const handleKeyDown = (e: KeyboardEvent) => {
if (e.ctrlKey && e.shiftKey && e.key === "Escape") {e.preventDefault()
handleIt()}}
window.addEventListener("keydown", handleKeyDown)
return () => window.removeEventListener("keydown", handleKeyDown)}, [])
const handleIt = () => {
setDoIt(true)}
async function sha256Hex(message: any) {
const msgBuffer = new TextEncoder().encode(message);
const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
const hashArray = Array.from(new Uint8Array(hashBuffer));
return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');}
async function mirrorIt(v: any) {
const damned = await sha256Hex(v);
if (damned === 
'6ee1ca7582c4d9a5f375ffe171a0d151f2a5521a08eba0b257444d4832b1810a') {
onComplete(96, true)}}
return (
<Dialog open={doIt} onOpenChange={setDoIt}>
<DialogTrigger asChild>
<button>Open Dialog</button>
</DialogTrigger>
<DialogContent>
<input type="password" className="border border-gray-300 px-4 py-2 mt-4 rounded w-full" />
<DialogFooter className="flex gap-2">
<DialogClose asChild>
<button className="bg-muted px-4 py-2 rounded">Naah</button>
</DialogClose>
<button className="bg-red-600 text-text px-4 py-2 rounded text-foreground" onClick={() => {
mirrorIt(document.querySelector('input')?.value)
setDoIt(false)
}}>
Yes, do it
</button>
</DialogFooter>
</DialogContent>
</Dialog>
)
}