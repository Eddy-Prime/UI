import Link from 'next/link'

const SideBar: React.FC = () => {
    return (
    <div className="m-0 p-0 w-[200px] bg-[#f1f1f1] fixed top-0 left-0 h-screen overflow-auto flex flex-col items-stretch z-50">
            
            
            <Link
                href="/dashboard"
                className="block px-6 py-3 text-xl text-black hover:bg-gray-600 transition-colors mb-2"
            >
                Dashboard
            </Link>
            <Link
                href="/batchAnalysis"
                className="block px-6 py-3 text-xl text-black hover:bg-gray-600 transition-colors mb-2"
            >
                Batch Analysis
            </Link>
            <Link
                href="/alarms"
                className="block px-6 py-3 text-xl text-black hover:bg-gray-600 transition-colors mb-2"
            >
                Alarms
            </Link>
            <Link
                href="/alarmAnalysis"
                className="block px-6 py-3 text-xl text-black hover:bg-gray-600 transition-colors mb-2"
            >
                Alarm Analysis
            </Link>
            <Link
                href="/materialAnalysis"
                className="block px-6 py-3 text-xl text-black hover:bg-gray-600 transition-colors mb-2"
            >
                Material Analysis
            </Link>
            <Link
                href="/materialTracking"
                className="block px-6 py-3 text-xl text-black hover:bg-gray-600 transition-colors mb-2"
            >
                Material Tracking
            </Link>
            <Link
                href="/aiChatbot"
                className="block px-6 py-3 text-xl text-black hover:bg-gray-600 transition-colors"
            >
                AI Chatbot
            </Link>
        </div>
    )
}

export default SideBar