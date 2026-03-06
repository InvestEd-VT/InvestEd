import { Button } from "../components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"

export default function Login() {
    return (
        <div className="flex min-h-screen items-center justify-between px-[17vw] bg-black">
            <div className="text-left mb-[10vh]">
                <h1 className="text-4xl font-bold text-white mb-4">InvestEd</h1>
                <p className="text-lg text-gray-400">Your investment education platform</p>
            </div>

            <Card className="w-full max-w-sm">
                <CardHeader>
                    <div className="space-y-1.5">
                        <CardTitle>Login to your account</CardTitle>
                        <CardDescription>
                            Enter your email below to login to your account
                        </CardDescription>
                    </div>
                    <CardAction>
                        <Button variant="link">Sign Up</Button>
                    </CardAction>
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
                            <div className="flex items-center">
                            <Label htmlFor="password" className="">Password</Label>
                            <a
                                href="#"
                                className="ml-auto text-sm underline-offset-4 hover:underline"
                            >
                                Forgot your password?
                            </a>
                            </div>
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
                    <Button type="submit" className="w-full">
                        Login
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}