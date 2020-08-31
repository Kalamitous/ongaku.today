import React from 'react'
import { Link } from 'react-router-dom'
import KeyboardReturn from '@material-ui/icons/KeyboardReturn'

const Privacy = () => (
    <div className="Page">
        <h2>Privacy Policy</h2>
        <br />
        <div className="horizontal-divider" />
        <br />
        <h5>
            If you choose to use <b>ongaku.today</b>, then you agree to the collection and use of information in relation to this policy.
            The Personal Information that we collect is used for providing and improving <b>ongaku.today</b>.
            We will not use or share your information with anyone except as described in this Privacy Policy.
        </h5>
        <br />
        <br />
        <h3>Information Collection and Use</h3>
        <br />
        <h5>
            For a better experience, and in order to provide our Service, we may require you to provide us, either directly or indirectly,
            with certain personally identifiable information, including but not limited to your email address and OAuth 2.0 credentials.
            The information that we request will be retained by us and used as described in this privacy policy.
            <br />
            The app uses third party services that may collect information used to identify you.
            Links to privacy policies of third party service providers used by <b>ongaku.today</b>:
            <ul>
                <li><a href="https://policies.google.com/privacy">Google Sign-In</a></li>
                <li><a href="https://policies.google.com/privacy">YouTube</a></li>
                <li><a href="https://policies.google.com/privacy">Firebase</a></li>
            </ul>
            <br />
            <b>ongaku.today</b> has the functionality to import from private playlists on YouTube.
            In order to do so, we will request to view YouTube information associated with your Google account.
            We only attempt to access your playlist data and do not store any of this data.
            The folders and playlists you create and the videos you add on ongaku.today are stored in our cloud database (Cloud Firestore).
            <br />
            By using <b>ongaku.today</b>, you are also agreeing to <a href="https://www.youtube.com/t/terms">YouTube Terms of Service</a>.
            You may revoke <b>ongaku.today</b> from accessing your data at any time by doing so from <a href="https://security.google.com/settings/security/permissions">Google security settings</a>.
        </h5>
        <br />
        <br />
        <h3>Other Service Providers</h3>
        <br />
        <h5>
            We may internally employ other third-party services, companies or individuals due to the following reasons:
            <ul>
                <li>To facilitate our Service;</li>
                <li>To provide the Service on our behalf;</li>
                <li>To perform Service-related services; or</li>
                <li>To assist us in analyzing how our Service is used.</li>
            </ul>
            <br />
            We want to inform users of our Service that these third parties may have access to your Personal Information.
            The reason is to perform the tasks assigned to them on our behalf.
            However, they are obligated not to disclose or use the information for any other purpose.
        </h5>
        <br />
        <br />
        <h3>Security</h3>
        <br />
        <h5>
            We value your trust in providing us your Personal Information, thus we are striving to use commercially acceptable means of protecting it.
            But remember that no method of transmission over the internet, or method of electronic storage is 100% secure and reliable,
            and therefore we cannot guarantee its absolute security.
        </h5>
        <br />
        <br />
        <h3>Links to Other Sites</h3>
        <br />
        <h5>
            This Service may contain links to other sites.
            If you click on a third-party link, you will be directed to that site.
            Note that these external sites are not operated by us.
            Therefore, we strongly advise you to review the Privacy Policy of these websites.
            We have no control over and assume no responsibility for the content, privacy policies, or practices of any third-party sites or services.
        </h5>
        <br />
        <br />
        <Link to="/"><h2 title="Return"><KeyboardReturn /></h2></Link>
    </div>
)

export default Privacy
