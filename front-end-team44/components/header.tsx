import Link from 'next/link'

const Header: React.FC = () => {

  return (
    <header className="h-24 p-3 border-b bg-gradient-to-br from-gray-900 to-gray-600 flex flex-col items-center justify-center fixed top-0 left-0 w-full z-50">
      <a className="flex mb-2 md:mb-5 text-white-50 text-3xl text-gray-300">
        Penguin Project
      </a>
      <nav className="items-center flex md:flex-row flex-col">
        <Link
          href="/"
          className="px-4 text-xl text-white hover:bg-gray-600 rounded-lg">
          Home
        </Link>
        <Link
          href="/players"
          className="px-4 text-xl text-white hover:bg-gray-600 rounded-lg">
          Players
        </Link>
        <Link
          href="/material"
          className=" px-4 text-xl text-white  hover:bg-gray-600 rounded-lg">
          Material Tracking
        </Link>

        <Link
          href="/analysis"
          className=" px-4 text-xl text-white  hover:bg-gray-600 rounded-lg">
          Alarm Analysis
        </Link>

   </nav>
    </header>
  )
}

export default Header
