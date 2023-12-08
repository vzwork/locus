import { Box, Button, ButtonGroup } from "@mui/material";
import {
  getBlob,
  getBytes,
  getDownloadURL,
  getStorage,
  ref,
} from "firebase/storage";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Document, Page } from "react-pdf";
import useResizeObserver from "@react-hook/resize-observer";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

const useSize = (target) => {
  const [size, setSize] = useState();

  useLayoutEffect(() => {
    setSize(target.current.getBoundingClientRect());
  }, [target]);

  // Where the magic happens
  useResizeObserver(target, (entry) => setSize(entry.contentRect));
  return size;
};

const options = {
  cMapUrl: "/cmaps/",
  standardFontDataUrl: "/standard_fonts/",
};

export default function Article(props) {
  const storage = getStorage();

  const containerRef = useRef(null);
  const containerWidth = useSize(containerRef);

  const [article, setArticle] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);

  const maxWidth = 800;

  useEffect(() => {
    if (!article) {
      getBytes(ref(storage, props.data.data.url)).then((bytes) => {
        const uint8View = new Uint8Array(bytes);
        setArticle({ data: uint8View });
      });
    }
  });

  function onDocumentLoadSuccess({ numPages: nextNumPages }) {
    setNumPages(nextNumPages);
  }

  return (
    <Box
      overflow={"scroll"}
      ref={containerRef}
      sx={{
        position: "relative",
        zIndex: "1",
        width: "100%",
        height: "500px",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Box sx={{ position: "absolute", bottom: "0", zIndex: "2" }}>
        <ButtonGroup>
          <Button
            size="small"
            variant="contained"
            color="inactive"
            onClick={() => {
              if (currentPage > 0) {
                setCurrentPage(currentPage - 1);
              }
            }}
          >
            prev
          </Button>
          <Button
            size="small"
            variant="contained"
            color="inactive"
            onClick={() => {
              if (currentPage + 1 < numPages) {
                setCurrentPage(currentPage + 1);
              }
            }}
          >
            next
          </Button>
        </ButtonGroup>
      </Box>
      {article ? (
        <Document
          file={article}
          options={options}
          pageIndex={1}
          onLoadSuccess={onDocumentLoadSuccess}
        >
          <Page
            key={`page_${currentPage + 1}`}
            pageNumber={currentPage + 1}
            scale={0.6}
            width={
              containerWidth ? Math.min(containerWidth, maxWidth) : maxWidth
            }
          />
        </Document>
      ) : null}
    </Box>
  );
}
