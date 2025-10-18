import { assets } from "../assets/assets"

const Hero = () => {
  return (
    // <div className="flex flex-col items-start justify-center px-6 md:px-16 lg-px-24 xl:px-32 text-white bg-[url('/src/assets/gradientBackground.png')] bg-no-repeat bg-cover bg-center h-screen">
    <div className="relative inline-flex flex-col w-full items-center mt-14 sm:mt-16 px-6 md:px-16 lg-px-24 xl:px-32 text-black bg-[url('/src/assets/gradientBackground.png')] bg-no-repeat bg-cover min-h-screen my-12 sm:my-16">
        <img src={assets.logoFull} alt="full logo" className="max-h-44 sm:max-h-56 md:max-h-60 mt-8" />
        <h1 className="font-playfair text-base md:text-2xl md:leading-[56px] font-bold md:font-extrabold mt-2">Investigator: Professor Mridula Sharma, PhD</h1>
        {/* <div className="items-start text-start mt-2">
            <h2 className="text-lg md:text-xl font-medium">Vision</h2>
            <p className="text-sm md:text-base font-light m-auto text-gray-600 max-w-xs sm:max-w-2xl">Evidence-based solutions to improve functional outcomes for people with listening difficulties</p>
        </div> */}
        <div className="text-start mt-2 max-w-xs sm:max-w-2xl">
            <div className="">
                <h2 className="text-lg md:text-xl font-medium">Vision</h2>
                <p className="text-sm md:text-base font-light m-auto text-gray-600">Evidence-based solutions to improve functional outcomes for people with listening difficulties</p>
            </div>
            <div className="mt-4">
                <h2 className="text-lg md:text-xl font-medium">What we do</h2>
                <p className="text-sm md:text-base font-light m-auto text-gray-600">I have designed research to elucidate the role of auditory and cognitive processing and the influence of language on functional outcomes such as speech perception in noise and reading.</p>
                <p className="text-sm md:text-base font-light m-auto text-gray-600">For this, I</p>
                <ul className="text-sm md:text-base font-light space-y-1 text-gray-600 list-disc list-inside ml-2">
                    <li>
                        explore mechanisms underlying the speech perception in noise
                    </li>
                    <li>
                        determine factors that contribute to speech perception in noise
                    </li>
                    <li>
                        link evidence-based research and clinical implications in my teaching
                    </li>
                </ul>
            </div>
        </div>

        <button className="mt-4 md:mt-8 bg-white px-10 py-2.5 rounded-lg border border-gray-300 hover:scale-102 active:scale-95 transition cursor-pointer text-sm">Participate in our research</button>

        <img src={assets.eegHome} alt="Home Image" className="mt-4 md:mt-8 max-h-44 sm:max-h-56 md:max-h-90" />
    </div>
  )
}
export default Hero