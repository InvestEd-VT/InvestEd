import { Link } from "react-router-dom"
import { Button } from "../components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"

const Register = () => {    
    return (
        <div className="flex min-h-screen items-center justify-between px-[17vw] bg-zinc-950">
            <div className="text-left mb-[10vh]">
                <h1 className="text-4xl font-bold text-white mb-4">Register</h1>
                <p className="text-lg text-gray-400 mb-3">Already have an account?</p>
                <CardAction>
                    <Link to="/login">
                        <Button className="w-full rounded-lg bg-zinc-50 px-4 py-2 text-sm font-medium text-zinc-900
                        hover:bg-zinc-200 active:bg-zinc-300
                        focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-1 focus:ring-offset-zinc-900
                        disabled:cursor-not-allowed disabled:opacity-50
                        transition-colors">
                            Sign In
                        </Button>
                    </Link>
                </CardAction>
            </div>

            <Card className="w-full max-w-sm bg-zinc-900 border-zinc-800 text-zinc-200">
                <CardHeader>
                    <CardTitle>Sign Up</CardTitle>
                </CardHeader>
                <CardContent>
                    <form>
                        <div className="flex flex-col gap-6">
                        <div className="grid gap-2">
                            <Label htmlFor="email" className="">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="Type your email"
                                required
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="password" className="">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Type your password"
                                required
                            />
                        </div>
                        </div>
                    </form>
                </CardContent>

                <CardFooter className="flex flex-col gap-2">
                    <Button type="submit" className="w-full rounded-lg bg-zinc-50 px-4 py-2 text-sm font-medium text-zinc-900
                        hover:bg-zinc-200 active:bg-zinc-300
                        focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-1 focus:ring-offset-zinc-900
                        disabled:cursor-not-allowed disabled:opacity-50
                        transition-colors">
                        Sign Up
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
};

export default Register;