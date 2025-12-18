import Product from "../../models/product.model.js";
import Category from "../../models/category.model.js";
import Brand from "../../models/brand.model.js";
import Subcategory from "../../models/sub_category.model.js";
import Metrics from "../../models/metrics.model.js";
import Inventory from "../../models/inventory.model.js";
import mongoose from "mongoose";
import { uploadToFirebaseStorage } from "../../helpers/uploadtofirebase.js"
const addProduct = async (req, res) => {
  try {
    console.log("Add product route was hit");
    // console.log("Add product route was hit",req.files);
    const userDetails = req.user;
    const allowedUsers = ['admin', 'superadmin'];
    const granted_permissions = userDetails.permission_component;
    //  console.log("User permissions---->",granted_permissions)  
    if (!allowedUsers.includes(userDetails.role)) {
      console.log("Un-authorised access only admin and superadmin allowed");
      return res.status(403).json({
        success: false,
        message: "Un-authorised access only admin and superadmin allowed"

      })

    }
    if (!granted_permissions[0].can_add_records) {
      console.log(`${userDetails.first_name} as a ${userDetails.role} is not allowed to add products`);
      return res.status(403).json({
        success: false,
        message: `${userDetails.first_name} as a ${userDetails.role} is not allowed to add products`
      })
    }


    //  console.log("User details in product",userDetails);


    let { product_name, product_description, product_price, discount_percentage, manufacturer, sales, featured, tags, isNew } = req.body;
    const { brand_id, category_id, sub_category_id, dimension_id } = req.query;
    //  console.log("brandId",brand_id,"categoryId",category_id,"subCategoryId",sub_category_id);    
    product_price = parseFloat(product_price);
    discount_percentage = parseFloat(discount_percentage);
    discount_percentage = discount_percentage ? discount_percentage : 0;
    // console.log("Discount",discount_percentage);
    console.log("Tags in product", tags, isNew);
    if (!product_name || !product_description || !product_price || !manufacturer || !sales || !featured || !tags || !isNew) {
      console.log("All fields are required");
      return res.status(403).json({
        success: false,
        message: "All fields are required"
      });
    }
    if (!mongoose.Types.ObjectId.isValid(brand_id) || !mongoose.Types.ObjectId.isValid(category_id) || !mongoose.Types.ObjectId.isValid(sub_category_id) || !mongoose.Types.ObjectId.isValid(dimension_id)) {
      console.log("invalid query fields");
      return res.status(403).json({
        success: false,
        message: "Invalid brand_id or category_id or sub_category_id"
      })
    }

    // checking whether query params exists in db;
    let existingBrand = await Brand.findById(brand_id);
    let existingCategory = await Category.findById(category_id);
    let existingSubcategory = await Subcategory.findById(sub_category_id);
    let existingDimension = await Metrics.findById(dimension_id);
    if (!existingBrand || !existingCategory || !existingSubcategory || !existingDimension) {
      console.log("Brand/Category/Subcategory does not exists from db");
      return res.status(404).json({
        success: false,
        message: "Brand or Category or Sub-category or dimension does not exists please add first"
      })
    }


    if (!req.files) {
      console.log("Avatar and CoverImages are required!");
      return res.status(403).json({
        success: false,
        message: "Avatar and CoverImages are required!"
      })
    }
    let avatarImage = req?.files.avatar[0];
    let coverImages = req?.files.cover_images;

    // console.log("Avatar image ",avatar`Image);
    if (!avatarImage) {
      console.log("Please select avatar");
      return res.status(403).json({
        success: false,
        message: "Please upload avatar"

      })
    }
    if (!coverImages.length) {
      console.log("Please upload product images");
      return res.status(403).json({
        success: false,
        message: "Please upload product images"

      })
    }

    // console.log("Product Price",product_price,typeof(product_price),typeof(discount_percentage),discount_percentage);
    const final_price = product_price - (product_price * (discount_percentage / 100));
    // console.log("Final price of product:",final_price);  

    // checking whether the product exists :
    const existingProduct = await Product.findOne({ product_name: product_name.toLowerCase() });
    if (existingProduct) {
      console.log("Product already exists update it according to the requirments");
      return res.status(403).json({
        success: false,
        message: "Product already exists update it according to the requirments"
      })
    }
    // now preparing images to upload :
    // avatar upload:
    let imgArr = [];
    const fileName = `assets/${avatarImage.originalname}`;
    const avatar_logo_url = await uploadToFirebaseStorage(
      avatarImage.buffer,
      fileName,
      avatarImage.mimetype
    );
    if (avatar_logo_url) {
      console.log("Avatar image uploaded", avatar_logo_url);
    }
    for (let i = 0; i < coverImages.length; i++) {
      let fileName = `assets/${coverImages[i].originalname}`;
      const coverimage_url = await uploadToFirebaseStorage(
        coverImages[i].buffer,
        fileName,
        coverImages[i].mimetype
      );
      if (coverimage_url) {
        let imgObj = {
          url: coverimage_url
        }
        imgArr.push(imgObj)
      }
    }
    if (imgArr.length) {
      console.log("Cover_images uploaded successfully");
    }
    // now preparing product doc to save in db:
    const finalTag = [];
    tags.map((elem) => {
      let obj = {
        tag_name: elem
      }
      finalTag.push(obj);

    });
    // console.log("Final tags", finalTag);
    const addProduct = await new Product({
      product_name: product_name.toLowerCase(),
      product_description: product_description.toLowerCase(),
      discount_precentage: discount_percentage,
      product_price: product_price,
      final_price: final_price,
      avatar: avatar_logo_url,
      cover_images: imgArr,
      product_category: category_id,
      product_sub_category: sub_category_id,
      product_brand: brand_id,
      dimensions: dimension_id,
      tags: finalTag,
      sales: sales,
      featured: featured,
      isNew: isNew,
      manufacturer: manufacturer,
      created_by: userDetails._id

    }).save();

    if (addProduct) {
      const count = await Product.countDocuments();
      const product_code = `ACC-${String(count + 1).padStart(3, "0")}`;
      // console.log("Product  count and new code ", count, product_code);
      // preparing product's corresponding inventory:
      await new Inventory({
        product_id: addProduct._id,
        product_stock: 0,
        product_code: product_code,
        stock_status: "Out Of Stock"
      }).save();
      console.log("Product was added successfulyy");
      return res.status(201).json({
        success: true,
        message: "product added successfuly",
        product: addProduct
      })
      // preparing the product inventory:

    } else {
      console.log("Product was not added");
      return res.status(403).json({
        success: false,
        message: "product added not added",

      })
    }
  }
  catch (err) {
    console.log("Error occured while adding products", err);
    return res.status(501).json({
      success: false,
      message: "Error occured while addibg products"
    })

  }
}

const fetchAllProducts = async (req, res) => {
  try {
    console.log("Fetch all products was hit");
    const userDetails = req.user;
    const allowedUsers = ['admin', 'superadmin'];
    const granted_permissions = userDetails.permission_component;
    if (!allowedUsers.includes(userDetails.role)) {
      console.log("Un-authorised access only admin and superadmin allowed");
      return res.status(403).json({
        success: false,
        message: "Un-authorised access only admin and superadmin allowed"

      })

    }
    if (!granted_permissions[0].can_read_records) {
      console.log(`${userDetails.first_name} as a ${userDetails.role} is not allowed to fetch products`);
      return res.status(403).json({
        success: false,
        message: `${userDetails.first_name} as a ${userDetails.role} is not allowed to fetch products`
      })
    }
    // perparing products to fetch       
    const allProducts = await Product.find();
    if (allProducts.length) {
      console.log("All products fetched successfully");
      return res.status(200).json({
        success: true,
        message: "All products fetched successfully",
        products: allProducts
      })

    } else {
      console.log("Products were not fetched");
      return res.status(404).json({
        success: false,
        message: "Products were not fetched"
      });
    }
  }
  catch (err) {
    console.log("Error occured while fetching products", err);
    return res.status(501).json({
      success: false,
      message: "Error occured while fetching all products"
    })
  }
}

const updateProduct = async (req, res) => {
  try {
    const userDetails = req.user;
    const allowedUsers = ['admin', 'superadmin'];
    const granted_permissions = userDetails.permission_component;
    if (!allowedUsers.includes(userDetails.role)) {
      console.log("Un-authorised access only admin and superadmin allowed");
      return res.status(403).json({
        success: false,
        message: "Un-authorised access only admin and superadmin allowed"

      })

    }
    if (!granted_permissions[0].can_update_records) {
      console.log(`${userDetails.first_name} as a ${userDetails.role} is not allowed to update products`);
      return res.status(403).json({
        success: false,
        message: `${userDetails.first_name} as a ${userDetails.role} is not allowed to update products`
      })
    }
    console.log("Update product was hit", userDetails);
    let { product_name, product_description, product_price, discount_percentage, manufacturer, sales, featured, tags, isNew } = req.body;
    let updateProduct = {};
    const { product_id } = req.query;
    if (!product_id) {
      return res.status(403).json({
        success: false,
        message: "Product id is mandatory!"
      });
    }
    if (product_name) {
      updateProduct.product_name = product_name.toLowerCase();
    }
    if (product_description) {
      updateProduct.product_description = product_description;
    }
    if (product_price) {
      product_price = parseFloat(product_price);
      discount_percentage = parseFloat(discount_percentage);
      discount_percentage = discount_percentage ? discount_percentage : 0;
      updateProduct.product_price = product_price;
      updateProduct.discount_percentage = discount_percentage;
      updateProduct.final_price = product_price - (product_price * (discount_percentage / 100));
    }


    // let coverImages = req?.files?.cover_images;
    let imgArr = [];
    let avatar_logo_url;
    let filterObj = { _id: product_id };
    if (req?.files?.avatar?.length) {
      const avatarImage = req.files.avatar[0];

      const fileName = `assets/${avatarImage.originalname}`;
      avatar_logo_url = await uploadToFirebaseStorage(
        avatarImage.buffer,
        fileName,
        avatarImage.mimetype
      );

      if (avatar_logo_url) {
        updateProduct.avatar = avatar_logo_url;
      }
    }

    if (req?.files?.cover_images?.length) {
      const coverImages = req.files.cover_images;
      let imgArr = [];

      for (let i = 0; i < coverImages.length; i++) {
        const fileName = `assets/${coverImages[i].originalname}`;

        const coverimage_url = await uploadToFirebaseStorage(
          coverImages[i].buffer,
          fileName,
          coverImages[i].mimetype
        );

        if (coverimage_url) {
          imgArr.push({ url: coverimage_url });
        }
      }

      if (imgArr.length) {
        updateProduct.cover_images = imgArr;
      }
    }
    // now preparing product doc to save in db:
    const finalTag = [];
    if (tags?.length) {


      tags.map((elem) => {
        let obj = {
          tag_name: elem
        }
        finalTag.push(obj);

      });
    }
    if (finalTag?.length) {
      updateProduct.tags = finalTag;
    }

    if (manufacturer) {
      updateProduct.manufacturer = manufacturer;
    }

    // sales = toBool(sales);
    // featured = toBool(featured);
    // isNew = toBool(isNew);
    if (sales) {
      updateProduct.sales = sales;
    }
    if (featured) {
      updateProduct.featured = featured;
    }
    if (isNew) {
      updateProduct.isNew = isNew;
    }

    console.log("Update Filter in update product:", updateProduct, typeof (sales));
    // console.log("Avatar Logo URL", avatar_logo_url);
    const productUpdate = await Product.updateOne(filterObj, {
      $set: updateProduct
    });
    if (productUpdate) {
      return res.status(201).json({
        success: true,
        message: "Product updated successfully"
      });
    }

  }
  catch (err) {
    console.log("Error occured while updating product", err);
    return res.status(501).json({
      success: false,
      message: "Error occured while updating product"
    });


  }


}

export { addProduct, updateProduct, fetchAllProducts };




