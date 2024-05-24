window.onload = function () {
    // Set date selector to current date
    document.getElementById("form-date").valueAsDate = new Date();

    // Fix textarea newlines
    Array.prototype.forEach.call(document.getElementsByTagName("textarea"), function (elem) {
        elem.placeholder = elem.placeholder.replace(/\\n/g, "\n");
    });
}

function reset_loa() {
    document.getElementById("form-prefixes").value = "";
    document.getElementById("form-network-name").value = "";
    document.getElementById("form-organization-name").value = "";
    document.getElementById("form-asn").value = "";
    document.getElementById("form-contact-name").value = "";
    document.getElementById("form-email").value = "";
    document.getElementById("form-phone").value = "";
    document.getElementById("form-notes").value = "";

}

function date_string() {
    let today = new Date();
    return `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`
}

function form_ok() {
    let all_filled = true;
    document.getElementById("form").querySelectorAll("[required]").forEach(function (i) {
        if (!all_filled) return;
        if (!i.value || i.value === "") all_filled = false;
    })
    if (!all_filled) {
        alert("Please complete all required fields")
    }
    return all_filled;
}

function load_peeringdb_data() {
    let local_asn = document.getElementById("form-asn").value;
    if (local_asn !== undefined) {
        fetch("https://www.peeringdb.com/api/net?asn=" + local_asn)
            .then(resp => resp.json())
            .then(data => {
                if (data.data.length === 1) {
                    network = data.data[0]
                    document.getElementById("form-network-name").value = network.name;
                }
            })
    }
}

function generate_loa() {
    let prefixes = document.getElementById("form-prefixes").value.replace(/(\r\n|\r|\n){2}/g, "$1").replace(/(\r\n|\r|\n){3,}/g, "$1\n").replace(/\n+$/, ""); // Remove duplicate newlines
    let organization_name = document.getElementById("form-organization-name").value;
    let peer_asn = document.getElementById("form-peer-asn").value.toUpperCase().replace("AS", "");
    let date = document.getElementById("form-date").value;
    let name = document.getElementById("form-network-name").value;
    let asn = document.getElementById("form-asn").value.toUpperCase().replace("AS", "");
    let contact_name = document.getElementById("form-contact-name").value;
    let contact_email = document.getElementById("form-email").value;
    let contact_phone = document.getElementById("form-phone").value;
    let notes = document.getElementById("form-notes").value.replace(/\n+$/, ""); // Remove trailing newline
    let nowDate = new Date(date).toLocaleDateString();

    let loa_body = 
`

To whom it may concern,


This letter serves to authorize AS${peer_asn}  to announce the following IP address blocks:

${prefixes}


As a representative of the above IP block(s) and AS${asn} (${name}), I hereby declare that my organization ${organization_name} (whom is authorized to use such internet resources), to sign for this LOA. All traffic comes from this AS number is fully responsible by my organization.  AS9267 and/or AS38254 operator(s) does not control, and are not responsible for any content that this ASN transmits through the testbed infrastructure. My organization also understands that the academic and/or commercial network transit service(s) provided by AS9267 and/or AS38254 may revoke/terminate by the operator(s) at any time for any reason without notice.

`
    if (notes !== "") {
        loa_body += "\n" + notes + "\n"
    }

    loa_body += 
`

Should you have any questions, please contact: 

E-mail: ${contact_email}
Phone: ${contact_phone}


Sincerely,


                                                                                        (signature)
___________________________________________

Name: ${contact_name}
Date: ${nowDate}

`
    return loa_body
}

function loa_pdf_doc() {
    let doc = new jspdf.jsPDF();

    let header_height = 20;
    let body_height = 30;

    // Image
    let logo = document.getElementById("logo-preview");
    if (logo.src !== "") {
        header_height = 50;
        body_height = 60;

        let target_height = 20;
        let target_width = (logo.width / logo.height) * target_height;
        doc.addImage(logo.src, 20, 20, target_width, target_height, "NONE", 0);
    }

    doc.setFontSize(20);
    doc.text(125, 35 ,"Letter of Authorization");

    doc.setFontSize(20);
    doc.text(20, 39,  "_____________________________________________");

    doc.setFontSize(12);
    let loa_body = generate_loa();
    doc.text(20, body_height, doc.splitTextToSize(loa_body, 175));


    doc.setFontSize(8);
    doc.setTextColor("gray");
    doc.text(20, 280, "Note: The applicant is required to sign the hardcopy document and subsequently scan it as a PDF for submission."+ "\n" + "Electronic signature is not accepted.Thank you for the cooperation.");

    return doc
}

function save_pdf_loa() {
    if (!form_ok()) {
        return
    }

    let doc = loa_pdf_doc();
    let peer_asn = document.getElementById("form-peer-asn").value.toUpperCase().replace("AS", "");
    doc.save("LoA_AS" + peer_asn + "_" + date_string() + ".pdf");
}
