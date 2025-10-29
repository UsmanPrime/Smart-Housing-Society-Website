import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import Overview from '../components/Overview'
import Features from '../components/Features'
import Perks from '../components/Perks'
import ContactForm from '../components/ContactForm'
import Footer from '../components/Footer'

export default function Home(){
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-20">
        <Hero />
        <Overview />
        <Features />
        <Perks />
        <ContactForm />
      </main>
      <Footer />
    </div>
  )
}
