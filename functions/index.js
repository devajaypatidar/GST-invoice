const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

exports.processBooking = functions.firestore.document('bookings/{bookingId}')
    .onUpdate(async (change , context ) =>{

        try{
            const newData = change.after.data();
            // const previousData = change.before.data();

            if(newData.status == "Finished"){
                const {name, totalBookingAmount,catagory } = newData;
                const gstAmount = calcualateGST(totalBookingAmount,catagory);
                const gstApiResponse = await submitGST(name,gstAmount );

                console.log("GST API ", gstApiResponse);

                return {message : "GST Filling process completed Successfully"};


            }
        }catch(e){
            console.error("Error processing booking:", error);
            return { error: 'An error occurred while processing the booking.' };
        }
    });


    // Function to calculate GST 
function calcualateGST(totalBookingAmount,catagory) {

    switch (catagory.toLowerCase()) {
        case 'food items':
            gstRate = 5;
            break;
        case 'essential commodities':
            gstRate = 0;
            break;
        case 'raw materials':
            gstRate = 5;
            break;
        case 'agricultural implements':
            gstRate = 12;
            break;
        case 'sugar, tea, coffee, and edible oil':
            gstRate = 5;
            break;
        case 'coal':
            gstRate = 5;
            break;
        case 'pharmaceuticals':
            gstRate = 12;
            break;
        case 'fertilizers':
            gstRate = 5;
            break;
        case 'newsprint':
            gstRate = 5;
            break;
        case 'handmade matches':
            gstRate = 5;
            break;
        case 'bidi wrappers':
            gstRate = 18;
            break;
        case 'spectacles':
            gstRate = 18;
            break;
        case 'processed foods':
            gstRate = 18;
            break;
        case 'luxury items and sin goods':
            gstRate = 28;
            break;
        default:
            gstRate = 18;
            break;
    }
    
    return totalBookingAmount * (gstRate/100); 
}

// GST file Function 
async function submitGST(name, gstAmount) {
    
    const apiEndpoint = 'https://example.com/gst/filing';
    const apiKey = 'YOUR_API_KEY';
    
    try {
        const response = await axios.post(apiEndpoint, {
            name: name,
            gstAmount: gstAmount,
            apiKey: apiKey
        });

        return response.data; 
    } catch (error) {
        throw new Error(`Failed to submit GST to API: ${error.message}`);
    }
}