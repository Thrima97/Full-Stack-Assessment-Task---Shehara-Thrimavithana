import companyCologo from '@/assets/logo.png';

export default function AppLogoIcon(props: React.ImgHTMLAttributes<HTMLImageElement>) {
    return (
        <img
            src={companyCologo}
            alt="Company Logo"
            className="w-[100px]"
            //   {...props}
        />
    );
}
