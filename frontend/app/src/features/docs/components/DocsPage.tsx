import { useParams } from "react-router-dom";

const DocsPage = () => {
  const { topic } = useParams<{ topic?: string }>();
  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-bold mb-4">Documentation (Only English)</h1>
      <div className="space-y-2">
        {!topic ? (
          <>
            <div className="collapse collapse-arrow bg-base-100 border border-base-300">
              <input type="radio" name="my-accordion-2" defaultChecked />
              <div className="collapse-title font-semibold">About the app</div>
              <div className="collapse-content text-sm">
                <p className="mb-2">
                  This app allows you to create a chatbot channel quickly and
                  easily based on your imported data. Then you can share the
                  channel with others using a QR code or a link. The chatbot can
                  answer questions based on the imported data and provide
                  helpful information.
                </p>
                <p className="mb-2">
                  The app can be used for various purposes, such as customer
                  support, knowledge sharing, and interactive experiences. You
                  can import your data in different formats, and the app will
                  process it to create a chatbot that understands your content.
                </p>
                <p className="mb-2">
                  The app is designed to be user-friendly and accessible,
                  allowing you to set up a chatbot channel without any coding
                  knowledge. You can customize the chatbot's behavior and
                  appearance to suit your needs.
                </p>
              </div>
            </div>
            <div className="collapse collapse-arrow bg-base-100 border border-base-300">
              <input type="radio" name="my-accordion-2" />
              <div className="collapse-title font-semibold">
                How to join the chatbot channel
              </div>
              <div className="collapse-content text-sm">
                <p className="mb-2">
                  To join a chatbot channel, you can either scan the QR code
                  provided by the channel creator or click on the link to access
                  the channel directly. Once you join, you can start interacting
                  with the chatbot and ask questions based on the imported data.
                </p>
              </div>
            </div>
          </>
        ) : (
          <div className="collapse collapse-arrow bg-base-100 border border-base-300">
            <input type="radio" name="my-accordion-2" />
            <div className="collapse-title font-semibold">
              The first release - version 1.0.0
            </div>
            <div className="collapse-content text-sm">
              <p className="mb-2">
                This is the first release of the app, version 1.0.0. It includes
                the core features for creating and sharing chatbot channels
                based on imported data. Users can join channels via QR codes or
                links, and the chatbot can answer questions based on the
                provided content. Future updates will bring more features and
                improvements to enhance the user experience.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocsPage;
