import React from 'react';
import Layout from '../Layout/Layout';
import HeroSection from '../Components/HeroSection';
import Courses from '../Components/Courses';
import WhyChooseUs from '../Components/WhyChooseUs';
import Gallery from '../Components/Gallery';
import Contact from '../Components/Contact';
import Event from '../Components/Event';
import Promo from '../Components/Promo';
import Books from '../Components/Books';
import Latest from '../Components/Latest';
import FeaturedVideoCourse from '../Components/FeaturedVideoCourse';
import FeaturedBy from '../Components/FeaturedBy';

function Home() {
    return (
        <Layout>
            <HeroSection />
            <Event />
            <Promo />
            <Courses />
            <Books />
            <Latest />
            <FeaturedVideoCourse />
            <FeaturedBy />
            {/* Optional Components */}
            {/* <WhyChooseUs />
            <Gallery />
            <Contact /> */}
        </Layout>
    );
}

export default Home;