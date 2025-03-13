module.exports = {

"[project]/src/app/GioiThieu/styles.module.scss.module.css [app-client] (css module)": ((__turbopack_context__) => {

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, t: __turbopack_require_real__ } = __turbopack_context__;
{
__turbopack_export_value__({
  "introductionCTA": "styles-module-scss-module__KaRn9W__introductionCTA",
  "introductionContent": "styles-module-scss-module__KaRn9W__introductionContent",
  "introductionDescription": "styles-module-scss-module__KaRn9W__introductionDescription",
  "introductionImage": "styles-module-scss-module__KaRn9W__introductionImage",
  "introductionImageWrapper": "styles-module-scss-module__KaRn9W__introductionImageWrapper",
  "introductionSection": "styles-module-scss-module__KaRn9W__introductionSection",
  "introductionTitle": "styles-module-scss-module__KaRn9W__introductionTitle",
  "shopNowButton": "styles-module-scss-module__KaRn9W__shopNowButton",
});
}}),
"[project]/src/app/GioiThieu/page.tsx [app-rsc] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, x: __turbopack_external_require__, y: __turbopack_external_import__, z: __turbopack_require_stub__ } = __turbopack_context__;
{
__turbopack_esm__({
    "default": (()=>IntroductionSection)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$GioiThieu$2f$styles$2e$module$2e$scss$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__ = __turbopack_import__("[project]/src/app/GioiThieu/styles.module.scss.module.css [app-client] (css module)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/next/image.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/next/dist/client/app-dir/link.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/framer-motion/dist/es/index.mjs [app-rsc] (ecmascript)");
;
;
;
;
;
const fadeInAnimationVariants = {
    initial: {
        opacity: 0,
        y: 20
    },
    animate: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.8,
            ease: "easeInOut"
        }
    }
};
const introductionContent = [
    {
        type: "h2",
        className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$GioiThieu$2f$styles$2e$module$2e$scss$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].introductionTitle,
        variants: fadeInAnimationVariants,
        transition: {
            delay: 0.2
        },
        content: "Khám Phá Thế Giới Công Nghệ Di Động Tuyệt Đỉnh!"
    },
    {
        type: "p",
        className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$GioiThieu$2f$styles$2e$module$2e$scss$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].introductionDescription,
        variants: fadeInAnimationVariants,
        transition: {
            delay: 0.4
        },
        content: "Chào mừng bạn đến với [Tên Website/Thương Hiệu] - nơi hội tụ những chiếc điện thoại thông minh mới nhất, mạnh mẽ nhất và phong cách nhất. Chúng tôi tự hào mang đến cho bạn trải nghiệm mua sắm trực tuyến hoàn hảo, với sự đa dạng về sản phẩm, chất lượng dịch vụ hàng đầu và mức giá cạnh tranh nhất trên thị trường."
    },
    {
        type: "image",
        className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$GioiThieu$2f$styles$2e$module$2e$scss$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].introductionImageWrapper,
        variants: fadeInAnimationVariants,
        transition: {
            delay: 0.6
        },
        src: "/qc1.webp",
        alt: "Điện thoại thông minh",
        width: 500,
        height: 300,
        imageClassName: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$GioiThieu$2f$styles$2e$module$2e$scss$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].introductionImage
    },
    {
        type: "cta",
        className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$GioiThieu$2f$styles$2e$module$2e$scss$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].introductionCTA,
        variants: fadeInAnimationVariants,
        transition: {
            delay: 0.8
        },
        href: "/qc1.webp",
        buttonClassName: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$GioiThieu$2f$styles$2e$module$2e$scss$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].shopNowButton,
        buttonText: "Khám Phá Ngay!"
    }
];
function IntroductionSection() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$GioiThieu$2f$styles$2e$module$2e$scss$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].introductionSection,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$GioiThieu$2f$styles$2e$module$2e$scss$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].introductionContent,
            children: introductionContent.map((item, index)=>{
                const motionProps = {
                    key: index,
                    className: item.className,
                    variants: item.variants,
                    initial: "initial",
                    animate: "animate",
                    transition: item.transition
                };
                switch(item.type){
                    case "h2":
                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["motion"].h2, {
                            ...motionProps,
                            children: item.content
                        }, void 0, false, {
                            fileName: "[project]/src/app/GioiThieu/page.tsx",
                            lineNumber: 94,
                            columnNumber: 17
                        }, this);
                    case "p":
                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["motion"].p, {
                            ...motionProps,
                            children: item.content
                        }, void 0, false, {
                            fileName: "[project]/src/app/GioiThieu/page.tsx",
                            lineNumber: 100,
                            columnNumber: 17
                        }, this);
                    case "image":
                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["motion"].div, {
                            ...motionProps,
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                                src: item.src ?? "",
                                alt: item.alt ?? "Image",
                                width: item.width,
                                height: item.height,
                                className: item.imageClassName
                            }, void 0, false, {
                                fileName: "[project]/src/app/GioiThieu/page.tsx",
                                lineNumber: 107,
                                columnNumber: 19
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/app/GioiThieu/page.tsx",
                            lineNumber: 106,
                            columnNumber: 17
                        }, this);
                    case "cta":
                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["motion"].div, {
                            ...motionProps,
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                                href: item.href ?? "#",
                                className: item.buttonClassName,
                                children: item.buttonText
                            }, void 0, false, {
                                fileName: "[project]/src/app/GioiThieu/page.tsx",
                                lineNumber: 119,
                                columnNumber: 19
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/app/GioiThieu/page.tsx",
                            lineNumber: 118,
                            columnNumber: 17
                        }, this);
                    default:
                        return null;
                }
            })
        }, void 0, false, {
            fileName: "[project]/src/app/GioiThieu/page.tsx",
            lineNumber: 80,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/app/GioiThieu/page.tsx",
        lineNumber: 77,
        columnNumber: 5
    }, this);
}
}}),
"[project]/src/app/GioiThieu/page.tsx [app-rsc] (ecmascript, Next.js server component)": ((__turbopack_context__) => {

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, t: __turbopack_require_real__ } = __turbopack_context__;
{
__turbopack_export_namespace__(__turbopack_import__("[project]/src/app/GioiThieu/page.tsx [app-rsc] (ecmascript)"));
}}),
"[project]/.next-internal/server/app/GioiThieu/page/actions.js [app-rsc] (ecmascript)": (function(__turbopack_context__) {

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, x: __turbopack_external_require__, y: __turbopack_external_import__, m: module, e: exports, t: __turbopack_require_real__ } = __turbopack_context__;
{
}}),

};

//# sourceMappingURL=_955212._.js.map