import {Component, Input, OnInit} from '@angular/core';
import {ProductService} from "../product.service";
import {Product} from "../product.model";

@Component({
  selector: 'app-product-tab-info',
  templateUrl: './product-tab-info.component.html',
  styleUrls: ['./product-tab-info.component.css']
})
export class ProductTabInfoComponent implements OnInit {

  @Input() product: Product;

  constructor(
    private productSer: ProductService,
  ) { }

  ngOnInit(): void {
  }

}
