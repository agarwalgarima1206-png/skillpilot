import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="h-[72px] border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-full max-w-[1180px] items-center justify-between px-6">

        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 font-serif text-xl font-semibold"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#5146e5]">
            <span className="text-sm text-white">✦</span>
          </div>

          FutureProof
        </Link>

        {/* Navigation */}
        <div className="flex items-center gap-7 text-sm text-gray-600">

          <Link
            to="/"
            className="cursor-pointer hover:text-black"
          >
            Home
          </Link>

          <Link
            to="/explore"
            className="cursor-pointer hover:text-black"
          >
            Explore
          </Link>

          <Link
            to="/chat"
            className="cursor-pointer hover:text-black"
          >
            AI Chat
          </Link>

          <Link
            to="/skill-gap"
            className="cursor-pointer hover:text-black"
          >
            Skill Gap
          </Link>

          <Link
            to="/roadmap"
            className="cursor-pointer hover:text-black"
          >
            Roadmap
          </Link>

          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#242424] text-xs font-semibold text-white">
            MP
          </div>

          <Link
            to="/auth"
            className="cursor-pointer hover:text-black"
          >
            Log Out
          </Link>

        </div>
      </div>
    </nav>
  );
}

export default Navbar;